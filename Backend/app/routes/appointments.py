from fastapi import APIRouter, Depends, HTTPException
from prisma import Prisma
from pydantic import BaseModel
from ..database import get_db
from ..routes.auth import get_current_active_user
from datetime import datetime
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/appointments", tags=["appointments"])

class AppointmentCreate(BaseModel):
    patientId: int
    doctorId: int
    dateTime: str
    status: str = "Scheduled"

class AppointmentUpdate(BaseModel):
    patientId: int | None = None  # Add patientId to allow updating the patient
    doctorId: int | None = None   # Add doctorId to allow updating the doctor
    dateTime: str | None = None
    status: str | None = None

@router.post("/", status_code=201)
async def create_appointment(
    appointment: AppointmentCreate,
    db: Prisma = Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    logger.debug(f"Creating appointment with data: {appointment}")
    try:
        patient = await db.patient.find_unique(where={"id": appointment.patientId})
        doctor = await db.doctor.find_unique(where={"id": appointment.doctorId})
        logger.debug(f"Patient: {patient}, Doctor: {doctor}")
        if not patient or not doctor:
            raise HTTPException(status_code=400, detail="Invalid patient or doctor ID")
        
        try:
            parsed_date = datetime.fromisoformat(appointment.dateTime.replace("Z", "+00:00"))
            logger.debug(f"Parsed dateTime: {parsed_date}")
        except ValueError as e:
            logger.error(f"Invalid dateTime format: {e}")
            raise HTTPException(status_code=400, detail="Invalid dateTime format, expected ISO 8601 (e.g., 2025-04-12T10:00:00Z)")

        new_appointment = await db.appointment.create(
            data={
                "patientId": appointment.patientId,
                "doctorId": appointment.doctorId,
                "dateTime": parsed_date,
                "status": appointment.status,
            },
            include={"patient": True, "doctor": True}
        )
        logger.debug(f"Created appointment: {new_appointment}")
        return new_appointment
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
        return appointment
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
        valid_appointments = [appt for appt in appointments if appt.patient and appt.doctor]
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
        existing = await db.appointment.find_unique(where={"id": appointment_id})
        if not existing:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        # Validate patientId and doctorId if provided
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
            update_data["patientId"] = appointment.patientId
        if appointment.doctorId is not None:
            update_data["doctorId"] = appointment.doctorId
        if appointment.dateTime:
            update_data["dateTime"] = datetime.fromisoformat(appointment.dateTime.replace("Z", "+00:00"))
        if appointment.status:
            update_data["status"] = appointment.status

        updated_appointment = await db.appointment.update(
            where={"id": appointment_id},
            data=update_data,
            include={"patient": True, "doctor": True}  # Include related data in the response
        )
        return updated_appointment
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