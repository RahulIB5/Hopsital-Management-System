from fastapi import APIRouter, Depends, HTTPException
from prisma import Prisma
from pydantic import BaseModel
from ..database import get_db

router = APIRouter(prefix="/medical-histories", tags=["medical-histories"])

class MedicalHistoryCreate(BaseModel):
    patientId: int
    diagnosis: str
    treatment: str | None
    date: str  # ISO date

class MedicalHistoryUpdate(BaseModel):
    diagnosis: str | None
    treatment: str | None
    date: str | None

@router.post("/", status_code=201)
async def create_medical_history(history: MedicalHistoryCreate, db: Prisma = Depends(get_db)):
    """Record a new medical history entry."""
    patient = await db.patient.find_unique(where={"id": history.patientId})
    if not patient:
        raise HTTPException(status_code=400, detail="Invalid patient ID")
    return await db.medicalhistory.create(
        data={
            "patientId": history.patientId,
            "diagnosis": history.diagnosis,
            "treatment": history.treatment,
            "date": history.date,
        }
    )

@router.get("/{history_id}")
async def get_medical_history(history_id: int, db: Prisma = Depends(get_db)):
    """Retrieve a medical history entry."""
    history = await db.medicalhistory.find_unique(
        where={"id": history_id},
        include={"patient": True}
    )
    if not history:
        raise HTTPException(status_code=404, detail="Medical history not found")
    return history

@router.get("/patient/{patient_id}")
async def get_patient_medical_histories(
    patient_id: int,
    skip: int = 0,
    limit: int = 10,
    db: Prisma = Depends(get_db)
):
    """List all medical history entries for a patient."""
    patient = await db.patient.find_unique(where={"id": patient_id})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return await db.medicalhistory.find_many(
        where={"patientId": patient_id},
        skip=skip,
        take=limit,
        order={"date": "desc"}
    )

@router.put("/{history_id}")
async def update_medical_history(history_id: int, history: MedicalHistoryUpdate, db: Prisma = Depends(get_db)):
    """Update a medical history entry."""
    existing = await db.medicalhistory.find_unique(where={"id": history_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Medical history not found")
    return await db.medicalhistory.update(
        where={"id": history_id},
        data={
            "diagnosis": history.diagnosis,
            "treatment": history.treatment,
            "date": history.date,
        }
    )

@router.delete("/{history_id}")
async def delete_medical_history(history_id: int, db: Prisma = Depends(get_db)):
    """Delete a medical history entry."""
    existing = await db.medicalhistory.find_unique(where={"id": history_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Medical history not found")
    return await db.medicalhistory.delete(where={"id": history_id})