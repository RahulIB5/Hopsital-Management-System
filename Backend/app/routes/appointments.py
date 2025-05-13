from fastapi import APIRouter, Depends, HTTPException
from prisma import Prisma
from pydantic import BaseModel
from ..database import get_db
from ..routes.auth import get_current_active_user
from datetime import datetime
import re
import logging
from twilio.rest import Client
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Twilio configuration
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

# SendGrid configuration
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
SENDGRID_SENDER_EMAIL = os.getenv("SENDGRID_SENDER_EMAIL")

# Initialize Twilio and SendGrid clients
twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
sendgrid_client = SendGridAPIClient(SENDGRID_API_KEY)

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/appointments", tags=["appointments"])

class AppointmentCreate(BaseModel):
    patientId: int
    doctorId: int
    dateTime: str
    status: str = "Scheduled"
    purpose: str | None = None

class AppointmentUpdate(BaseModel):
    patientId: int | None = None
    doctorId: int | None = None
    dateTime: str | None = None
    status: str | None = None
    purpose: str | None = None

async def send_notifications(patient: dict, appointment: dict, doctor: dict, action: str):
    """
    Send an immediate SMS and email notification for the appointment.
    """
    try:
        # Prepare the message body
        date_time = appointment["dateTime"]
        message_body = (
            f"Your appointment has been {action}: "
            f"Date: {date_time}, "
            f"Doctor: {doctor['name']}, "
            f"Purpose: {appointment['purpose'] or 'N/A'}."
        )

        # Send immediate SMS
        if "phone" in patient and patient["phone"]:
            logger.debug(f"Sending immediate SMS to {patient['phone']}")
            twilio_client.messages.create(
                body=message_body,
                from_=TWILIO_PHONE_NUMBER,
                to=patient["phone"],
            )
            logger.info(f"Immediate SMS sent successfully to {patient['phone']}")
        else:
            logger.warning(f"No phone number provided for patient: {patient.get('id')}")

        # Send email
        if "email" in patient and patient["email"]:
            email_pattern = re.compile(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$')
            if email_pattern.match(patient["email"]):
                logger.debug(f"Sending email to {patient['email']}")
                email_message = Mail(
                    from_email=SENDGRID_SENDER_EMAIL,
                    to_emails=patient["email"],
                    subject=f"Appointment {action.capitalize()} Confirmation",
                    plain_text_content=message_body,
                    html_content=f"<p>{message_body}</p>",
                )
                response = sendgrid_client.send(email_message)
                logger.info(f"Email sent successfully to {patient['email']}, status: {response.status_code}")
            else:
                logger.warning(f"Invalid email format for patient {patient.get('id')}: {patient['email']}")
        else:
            logger.warning(f"No email provided for patient: {patient.get('id')}")

    except Exception as e:
        logger.error(f"Error sending notifications: {str(e)}", exc_info=True)
        # Log the error but don't raise an exception to avoid interrupting the appointment process
        pass

@router.post("/", status_code=201)
async def create_appointment(
    appointment: AppointmentCreate,
    db: Prisma = Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    logger.debug(f"Creating appointment with data: {appointment}")
    try:
        # Validate patient and doctor existence
        patient = await db.patient.find_unique(where={"id": appointment.patientId})
        doctor = await db.doctor.find_unique(where={"id": appointment.doctorId})
        logger.debug(f"Patient: {patient}, Doctor: {doctor}")
        if not patient:
            raise HTTPException(status_code=400, detail=f"Patient with ID {appointment.patientId} not found")
        if not doctor:
            raise HTTPException(status_code=400, detail=f"Doctor with ID {appointment.doctorId} not found")
        
        # Parse dateTime
        try:
            parsed_date = datetime.fromisoformat(appointment.dateTime.replace("Z", "+00:00"))
            logger.debug(f"Parsed dateTime: {parsed_date}")
        except ValueError as e:
            logger.error(f"Invalid dateTime format: {e}")
            raise HTTPException(status_code=400, detail="Invalid dateTime format, expected ISO 8601 (e.g., 2025-04-12T10:00:00Z)")

        # Check for existing appointment with same patientId, doctorId, and dateTime
        existing_appointment = await db.appointment.find_first(
            where={
                "patientId": appointment.patientId,
                "doctorId": appointment.doctorId,
                "dateTime": parsed_date,
            },
            include={"patient": True, "doctor": True}
        )

        if existing_appointment:
            logger.debug(f"Found existing appointment: {existing_appointment.id}, status: {existing_appointment.status}")
            if existing_appointment.status == "Scheduled" and appointment.status == "Confirmed":
                logger.info(f"Updating existing appointment {existing_appointment.id} from 'Scheduled' to 'Confirmed'")
                updated_appointment = await db.appointment.update(
                    where={"id": existing_appointment.id},
                    data={
                        "status": "Confirmed",
                        "purpose": appointment.purpose if appointment.purpose is not None else existing_appointment.purpose,
                    },
                    include={"patient": True, "doctor": True}
                )
                # Send notifications for the update
                await send_notifications(
                    patient=patient.__dict__,
                    appointment={
                        "dateTime": updated_appointment.dateTime.isoformat(),
                        "purpose": updated_appointment.purpose,
                    },
                    doctor=doctor.__dict__,
                    action="updated"
                )
                # Serialize the response for the updated appointment
                return {
                    "id": updated_appointment.id,
                    "patientId": updated_appointment.patientId,
                    "doctorId": updated_appointment.doctorId,
                    "patient": {
                        "id": updated_appointment.patient.id,
                        "name": updated_appointment.patient.name,
                        "email": updated_appointment.patient.email,
                        "phone": updated_appointment.patient.phone,
                        "dob": updated_appointment.patient.dob if isinstance(updated_appointment.patient.dob, str) else (updated_appointment.patient.dob.isoformat() if updated_appointment.patient.dob else None),
                        "medicalHistory": updated_appointment.patient.medicalHistory,
                        "appointments": None
                    },
                    "doctor": {
                        "id": updated_appointment.doctor.id,
                        "name": updated_appointment.doctor.name,
                        "specialty": updated_appointment.doctor.specialty,
                        "appointments": None
                    },
                    "dateTime": updated_appointment.dateTime.isoformat(),
                    "status": updated_appointment.status,
                    "purpose": updated_appointment.purpose
                }
            else:
                logger.warning(f"Duplicate appointment detected for patient {appointment.patientId}, doctor {appointment.doctorId}, at {parsed_date}")
                raise HTTPException(
                    status_code=400,
                    detail="An appointment already exists for this patient, doctor, and time. Cannot create a duplicate."
                )

        # Create new appointment if no matching appointment exists
        new_appointment = await db.appointment.create(
            data={
                "patient": {"connect": {"id": appointment.patientId}},
                "doctor": {"connect": {"id": appointment.doctorId}},
                "dateTime": parsed_date,
                "status": appointment.status,
                "purpose": appointment.purpose,
            },
            include={"patient": True, "doctor": True}
        )
        logger.debug(f"Created appointment: {new_appointment}")

        # Send notifications for the new appointment
        await send_notifications(
            patient=patient.__dict__,
            appointment={
                "dateTime": new_appointment.dateTime.isoformat(),
                "purpose": new_appointment.purpose,
            },
            doctor=doctor.__dict__,
            action="confirmed"
        )

        # Serialize the response
        return {
            "id": new_appointment.id,
            "patientId": new_appointment.patientId,
            "doctorId": new_appointment.doctorId,
            "patient": {
                "id": new_appointment.patient.id,
                "name": new_appointment.patient.name,
                "email": new_appointment.patient.email,
                "phone": new_appointment.patient.phone,
                "dob": new_appointment.patient.dob if isinstance(new_appointment.patient.dob, str) else (new_appointment.patient.dob.isoformat() if new_appointment.patient.dob else None),
                "medicalHistory": new_appointment.patient.medicalHistory,
                "appointments": None
            },
            "doctor": {
                "id": new_appointment.doctor.id,
                "name": new_appointment.doctor.name,
                "specialty": new_appointment.doctor.specialty,
                "appointments": None
            },
            "dateTime": new_appointment.dateTime.isoformat(),
            "status": new_appointment.status,
            "purpose": new_appointment.purpose
        }
    except Exception as e:
        logger.error(f"Error creating appointment: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/{appointment_id}")
async def get_appointment(
    appointment_id: int,
    db: Prisma = Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    logger.debug(f"Fetching appointment with ID: {appointment_id}")
    try:
        appointment = await db.appointment.find_unique(
            where={"id": appointment_id},
            include={"patient": True, "doctor": True}
        )
        if not appointment or not appointment.patient or not appointment.doctor:
            raise HTTPException(status_code=404, detail="Appointment or related data not found")
        # Explicitly serialize the response
        return {
            "id": appointment.id,
            "patientId": appointment.patientId,
            "doctorId": appointment.doctorId,
            "patient": {
                "id": appointment.patient.id,
                "name": appointment.patient.name,
                "email": appointment.patient.email,
                "phone": appointment.patient.phone,
                "dob": appointment.patient.dob if isinstance(appointment.patient.dob, str) else (appointment.patient.dob.isoformat() if appointment.patient.dob else None),
                "medicalHistory": appointment.patient.medicalHistory,
                "appointments": None
            },
            "doctor": {
                "id": appointment.doctor.id,
                "name": appointment.doctor.name,
                "specialty": appointment.doctor.specialty,
                "appointments": None
            },
            "dateTime": appointment.dateTime.isoformat(),
            "status": appointment.status,
            "purpose": appointment.purpose
        }
    except Exception as e:
        logger.error(f"Error fetching appointment {appointment_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/")
async def list_appointments(
    patient_id: int | None = None,
    doctor_id: int | None = None,
    date: str | None = None,
    skip: int = 0,
    limit: int = 10,
    db: Prisma = Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    logger.debug(f"Listing appointments with filters: patient_id={patient_id}, doctor_id={doctor_id}, date={date}")
    try:
        logger.debug("Building query filters")
        where = {}
        if patient_id:
            where["patientId"] = patient_id
        if doctor_id:
            where["doctorId"] = doctor_id
        if date:
            logger.debug(f"Parsing date: {date}")
            start = datetime.fromisoformat(date.replace("Z", "+00:00")).replace(hour=0, minute=0)
            end = start.replace(hour=23, minute=59)
            where["dateTime"] = {"gte": start, "lte": end}
        
        logger.debug("Executing Prisma query")
        appointments = await db.appointment.find_many(
            where=where,
            include={"patient": True, "doctor": True},
            skip=skip,
            take=limit,
            order={"dateTime": "asc"}
        )
        logger.debug(f"Retrieved {len(appointments)} appointments")
        
        logger.debug("Filtering valid appointments")
        valid_appointments = [
            {
                "id": appt.id,
                "patientId": appt.patientId,
                "doctorId": appt.doctorId,
                "patient": {
                    "id": appt.patient.id,
                    "name": appt.patient.name,
                    "email": appt.patient.email,
                    "phone": appt.patient.phone,
                    "dob": appt.patient.dob if isinstance(appt.patient.dob, str) else (appt.patient.dob.isoformat() if appt.patient.dob else None),
                    "medicalHistory": appt.patient.medicalHistory,
                    "appointments": None
                },
                "doctor": {
                    "id": appt.doctor.id,
                    "name": appt.doctor.name,
                    "specialty": appt.doctor.specialty,
                    "appointments": None
                },
                "dateTime": appt.dateTime.isoformat(),
                "status": appt.status,
                "purpose": appt.purpose
            }
            for appt in appointments if appt.patient and appt.doctor
        ]
        logger.debug(f"Returning {len(valid_appointments)} valid appointments")
        return valid_appointments
    except Exception as e:
        logger.error(f"Error listing appointments: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.put("/{appointment_id}")
async def update_appointment(
    appointment_id: int,
    appointment: AppointmentUpdate,
    db: Prisma = Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    logger.debug(f"Updating appointment {appointment_id} with data: {appointment}")
    try:
        existing = await db.appointment.find_unique(where={"id": appointment_id}, include={"patient": True, "doctor": True})
        if not existing:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        # Validate patientId and doctorId if provided
        patient = existing.patient
        doctor = existing.doctor
        if appointment.patientId is not None:
            patient = await db.patient.find_unique(where={"id": appointment.patientId})
            if not patient:
                raise HTTPException(status_code=400, detail="Invalid patient ID")
        if appointment.doctorId is not None:
            doctor = await db.doctor.find_unique(where={"id": appointment.doctorId})
            if not doctor:
                raise HTTPException(status_code=400, detail="Invalid doctor ID")
        
        update_data = {}
        if appointment.patientId is not None:
            update_data["patient"] = {"connect": {"id": appointment.patientId}}
        if appointment.doctorId is not None:
            update_data["doctor"] = {"connect": {"id": appointment.doctorId}}
        if appointment.dateTime:
            update_data["dateTime"] = datetime.fromisoformat(appointment.dateTime.replace("Z", "+00:00"))
        if appointment.status:
            update_data["status"] = appointment.status
        if appointment.purpose is not None:
            update_data["purpose"] = appointment.purpose

        updated_appointment = await db.appointment.update(
            where={"id": appointment_id},
            data=update_data,
            include={"patient": True, "doctor": True}
        )

        # Send notifications for the update
        await send_notifications(
            patient=patient.__dict__,
            appointment={
                "dateTime": updated_appointment.dateTime.isoformat(),
                "purpose": updated_appointment.purpose,
            },
            doctor=doctor.__dict__,
            action="updated"
        )

        # Serialize the response
        return {
            "id": updated_appointment.id,
            "patientId": updated_appointment.patientId,
            "doctorId": updated_appointment.doctorId,
            "patient": {
                "id": updated_appointment.patient.id,
                "name": updated_appointment.patient.name,
                "email": updated_appointment.patient.email,
                "phone": updated_appointment.patient.phone,
                "dob": updated_appointment.patient.dob if isinstance(updated_appointment.patient.dob, str) else (updated_appointment.patient.dob.isoformat() if updated_appointment.patient.dob else None),
                "medicalHistory": updated_appointment.patient.medicalHistory,
                "appointments": None
            },
            "doctor": {
                "id": updated_appointment.doctor.id,
                "name": updated_appointment.doctor.name,
                "specialty": updated_appointment.doctor.specialty,
                "appointments": None
            },
            "dateTime": updated_appointment.dateTime.isoformat(),
            "status": updated_appointment.status,
            "purpose": updated_appointment.purpose
        }
    except Exception as e:
        logger.error(f"Error updating appointment {appointment_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.delete("/{appointment_id}")
async def cancel_appointment(
    appointment_id: int,
    db: Prisma = Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    logger.debug(f"Deleting appointment {appointment_id}")
    try:
        existing = await db.appointment.find_unique(where={"id": appointment_id})
        if not existing:
            raise HTTPException(status_code=404, detail="Appointment not found")
        return await db.appointment.delete(where={"id": appointment_id})
    except Exception as e:
        logger.error(f"Error deleting appointment {appointment_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")