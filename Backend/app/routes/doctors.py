from fastapi import APIRouter, Depends, HTTPException
from prisma import Prisma
from pydantic import BaseModel
from ..database import get_db
from ..routes.auth import get_current_active_user

router = APIRouter(prefix="/doctors", tags=["doctors"])

class DoctorCreate(BaseModel):
    name: str
    specialty: str

class DoctorUpdate(BaseModel):
    name: str | None
    specialty: str | None

@router.post("/", status_code=201)
async def create_doctor(
    doctor: DoctorCreate,
    db: Prisma = Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    return await db.doctor.create(
        data={
            "name": doctor.name,
            "specialty": doctor.specialty,
        }
    )

@router.get("/{doctor_id}")
async def get_doctor(
    doctor_id: int,
    db: Prisma = Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    doctor = await db.doctor.find_unique(
        where={"id": doctor_id},
        include={"appointments": True}
    )
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor

@router.get("/")
async def list_doctors(
    specialty: str | None = None,
    skip: int = 0,
    limit: int = 10,
    db: Prisma = Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    where = {}
    if specialty:
        where["specialty"] = {"contains": specialty}
    return await db.doctor.find_many(
        where=where,
        skip=skip,
        take=limit,
        order={"id": "asc"}
    )

@router.put("/{doctor_id}")
async def update_doctor(
    doctor_id: int,
    doctor: DoctorUpdate,
    db: Prisma = Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    existing = await db.doctor.find_unique(where={"id": doctor_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return await db.doctor.update(
        where={"id": doctor_id},
        data={
            "name": doctor.name,
            "specialty": doctor.specialty,
        }
    )

@router.delete("/{doctor_id}")
async def delete_doctor(
    doctor_id: int,
    db: Prisma = Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    existing = await db.doctor.find_unique(where={"id": doctor_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return await db.doctor.delete(where={"id": doctor_id})