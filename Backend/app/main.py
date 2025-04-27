from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import patients, appointments, doctors, medical_histories, auth, users
from .database import get_db

app = FastAPI(
    title="Healthcare Patient Management System (HPMS)",
    description="API for managing patient records, appointments, medical histories, and notifications.",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, specify your frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)  # Add the auth router
app.include_router(users.router)  # Add the users router
app.include_router(patients.router)
app.include_router(appointments.router)
app.include_router(doctors.router)
app.include_router(medical_histories.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the HPMS API - Healthcare Patient Management System"}