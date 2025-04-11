from fastapi import FastAPI
from .routes import patients, appointments, doctors, medical_histories

from .database import get_db

app = FastAPI(
    title="Healthcare Patient Management System (HPMS)",
    description="API for managing patient records, appointments, medical histories, and notifications.",
    version="1.0.0"
)

#
# Include routers
app.include_router(patients.router)
app.include_router(appointments.router)
app.include_router(doctors.router)
app.include_router(medical_histories.router)
# app.include_router(auth.router)  # Comment out if not using authentication

@app.get("/")
async def root():
    return {"message": "Welcome to the HPMS API - Healthcare Patient Management System"}