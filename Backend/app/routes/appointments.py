from fastapi import APIRouter, Depends, HTTPException
from prisma import Prisma
from pydantic import BaseModel
from ..database import get_db
from datetime import datetime

router = APIRouter(prefix="/appointments", tags=["appointments"])

class AppointmentCreate(BaseModel):
    patientId: int
    doctorId: int
    dateTime: str  # ISO datetime, e.g., "2025-04-12T10:00:00Z"
    status: str = "Scheduled"

class AppointmentUpdate(BaseModel):
    dateTime: str | None
    status: str | None

@router.post("/", status_code=201)
async def create_appointment(appointment: AppointmentCreate, db: Prisma = Depends(get_db)):
    """Schedule a new appointment."""
    # Validate patient and doctor exist
    patient = await db.patient.find_unique(where={"id": appointment.patientId})
    doctor = await db.doctor.find_unique(where={"id": appointment.doctorId})
    if not patient or not doctor:
        raise HTTPException(status_code=400, detail="Invalid patient or doctor ID")
    return await db.appointment.create(
        data={
            "patientId": appointment.patientId,
            "doctorId": appointment.doctorId,
            "dateTime": appointment.dateTime,
            "status": appointment.status,
        }
    )

@router.get("/{appointment_id}")
async def get_appointment(appointment_id: int, db: Prisma = Depends(get_db)):
    """Retrieve an appointment by ID with patient and doctor details."""
    appointment = await db.appointment.find_unique(
        where={"id": appointment_id},
        include={"patient": True, "doctor": True}
    )
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment

@router.get("/")
async def list_appointments(
    patient_id: int | None = None,
    doctor_id: int | None = None,
    date: str | None = None,  # ISO date, e.g., "2025-04-12"
    skip: int = 0,
    limit: int = 10,
    db: Prisma = Depends(get_db)
):
    """List appointments with filters for patient, doctor, or date."""
    where = {}
    if patient_id:
        where["patientId"] = patient_id
    if doctor_id:
        where["doctorId"] = doctor_id
    if date:
        start = datetime.fromisoformat(date.replace("Z", "+00:00")).replace(hour=0, minute=0)
        end = start.replace(hour=23, minute=59)
        where["dateTime"] = {"gte": start, "lte": end}
    return await db.appointment.find_many(
        where=where,
        include={"patient": True, "doctor": True},
        skip=skip,
        take=limit,
        order={"dateTime": "asc"}
    )

@router.put("/{appointment_id}")
async def update_appointment(appointment_id: int, appointment: AppointmentUpdate, db: Prisma = Depends(get_db)):
    """Update appointment details (e.g., reschedule or change status)."""
    existing = await db.appointment.find_unique(where={"id": appointment_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return await db.appointment.update(
        where={"id": appointment_id},
        data={
            "dateTime": appointment.dateTime,
            "status": appointment.status,
        }
    )

@router.delete("/{appointment_id}")
async def cancel_appointment(appointment_id: int, db: Prisma = Depends(get_db)):
    """Cancel an appointment."""
    existing = await db.appointment.find_unique(where={"id": appointment_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return await db.appointment.delete(where={"id": appointment_id})