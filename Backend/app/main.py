from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import patients, appointments, doctors, medical_histories, auth, users
from .database import get_db
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(
    title="Healthcare Patient Management System (HPMS)",
    description="API for managing patient records, appointments, medical histories, and notifications.",
    version="1.0.0"
)

origins = [
    "https://hospital-management-system.vercel.app",  # your frontend
    "http://localhost:5173"  # for local dev
]

# CORS — only local for now
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(patients.router)
app.include_router(appointments.router)
app.include_router(doctors.router)
app.include_router(medical_histories.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the HPMS API - Healthcare Patient Management System"}