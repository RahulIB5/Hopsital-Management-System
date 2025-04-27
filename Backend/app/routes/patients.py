from fastapi import APIRouter, Depends, HTTPException
from prisma import Prisma
from pydantic import BaseModel
from ..database import get_db
from ..routes.auth import get_current_active_user  # Import auth dependency

router = APIRouter(prefix="/patients", tags=["patients"])

class PatientCreate(BaseModel):
    name: str
    email: str
    phone: str | None
    dob: str

class PatientUpdate(BaseModel):
    name: str | None
    phone: str | None
    dob: str | None

@router.post("/", status_code=201)
async def create_patient(
    patient: PatientCreate,
    db: Prisma = Depends(get_db),
    current_user=Depends(get_current_active_user)  # Add auth
):
    existing = await db.patient.find_unique(where={"email": patient.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")
    return await db.patient.create(
        data={
            "name": patient.name,
            "email": patient.email,
            "phone": patient.phone,
            "dob": patient.dob,
        }
    )

@router.get("/{patient_id}")
async def get_patient(
    patient_id: int,
    db: Prisma = Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    patient = await db.patient.find_unique(
        where={"id": patient_id},
        include={"medicalHistory": True, "appointments": True}
    )
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@router.get("/")
async def list_patients(
    name: str | None = None,
    email: str | None = None,
    skip: int = 0,
    limit: int = 10,
    db: Prisma = Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    where = {}
    if name:
        where["name"] = {"contains": name}
    if email:
        where["email"] = {"contains": email}
    return await db.patient.find_many(
        where=where,
        skip=skip,
        take=limit,
        order={"id": "asc"}
    )

@router.put("/{patient_id}")
async def update_patient(
    patient_id: int,
    patient: PatientUpdate,
    db: Prisma = Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    existing = await db.patient.find_unique(where={"id": patient_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Patient not found")
    return await db.patient.update(
        where={"id": patient_id},
        data={
            "name": patient.name,
            "phone": patient.phone,
            "dob": patient.dob,
        }
    )

@router.delete("/{patient_id}")
async def delete_patient(
    patient_id: int,
    db: Prisma = Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    existing = await db.patient.find_unique(where={"id": patient_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Patient not found")
    return await db.patient.delete(where={"id": patient_id})