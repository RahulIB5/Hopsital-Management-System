# import asyncio
# import sys
# from passlib.context import CryptContext
# from prisma import Prisma
# from datetime import datetime

# # Initialize password hasher
# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# async def seed_database():
#     # Connect to the database
#     prisma = Prisma()
#     await prisma.connect()

#     try:
#         # --- Seed Users ---
#         test_users = [
#             {
#                 "email": "admin@example.com.com",
#                 "password": pwd_context.hash("admin123"),
#                 "role": "admin"
#             },
#             {
#                 "email": "doctor@example.com",
#                 "password": pwd_context.hash("doctor123"),
#                 "role": "doctor"
#             },
#             {
#                 "email": "nurse@example.com.com",
#                 "password": pwd_context.hash("nurse123"),
#                 "role": "nurse"
#             }
#         ]

#         for user_data in test_users:
#             existing_user = await prisma.user.find_unique(
#                 where={"email": user_data["email"]}
#             )
#             if not existing_user:
#                 await prisma.user.create(data=user_data)
#                 print(f"Created user: {user_data['email']} with role: {user_data['role']}")
#             else:
#                 print(f"User {user_data['email']} already exists")

#         # --- Seed Patients ---
#         test_patients = [
#             {
#                 "name": "Rajjo",
#                 "email": "john.doe@example.com",
#                 "phone": "1234567890",
#                 "dob": "1990-01-01"
#             },
#             {
#                 "name": "Jane Smith",
#                 "email": "jane.smith@example.com",
#                 "phone": "0987654321",
#                 "dob": "1985-05-15"
#             }
#         ]

#         for patient_data in test_patients:
#             existing_patient = await prisma.patient.find_unique(
#                 where={"email": patient_data["email"]}
#             )
#             if not existing_patient:
#                 patient = await prisma.patient.create(data=patient_data)
#                 print(f"Created patient: {patient_data['name']}")
#             else:
#                 print(f"Patient {patient_data['email']} already exists")

#         # --- Seed Doctors ---
#         test_doctors = [
#             {
#                 "name": "Dr. Smith",
#                 "specialty": "Cardiology"
#             },
#             {
#                 "name": "Dr. Brown",
#                 "specialty": "Neurology"
#             }
#         ]

#         for doctor_data in test_doctors:
#             existing_doctor = await prisma.doctor.find_first(
#                 where={"name": doctor_data["name"], "specialty": doctor_data["specialty"]}
#             )
#             if not existing_doctor:
#                 doctor = await prisma.doctor.create(data=doctor_data)
#                 print(f"Created doctor: {doctor_data['name']}")
#             else:
#                 print(f"Doctor {doctor_data['name']} already exists")

#         # --- Seed Appointments ---
#         # Fetch patients and doctors to reference their IDs
#         patient1 = await prisma.patient.find_first(where={"email": "john.doe@example.com"})
#         patient2 = await prisma.patient.find_first(where={"email": "jane.smith@example.com"})
#         doctor1 = await prisma.doctor.find_first(where={"name": "Dr. Smith"})
#         doctor2 = await prisma.doctor.find_first(where={"name": "Dr. Brown"})

#         test_appointments = [
#             {
#                 "patientId": patient1.id,
#                 "doctorId": doctor1.id,
#                 "dateTime": datetime.fromisoformat("2025-04-29T15:32:00+00:00"),
#                 "status": "Scheduled",
#                 "purpose": "Checkup"
#             },
#             {
#                 "patientId": patient2.id,
#                 "doctorId": doctor2.id,
#                 "dateTime": datetime.fromisoformat("2025-04-30T10:00:00+00:00"),
#                 "status": "Scheduled",
#                 "purpose": "Consultation"
#             }
#         ]

#         for appt_data in test_appointments:
#             existing_appt = await prisma.appointment.find_first(
#                 where={
#                     "patientId": appt_data["patientId"],
#                     "doctorId": appt_data["doctorId"],
#                     "dateTime": appt_data["dateTime"]
#                 }
#             )
#             if not existing_appt:
#                 appt = await prisma.appointment.create(data=appt_data)
#                 print(f"Created appointment for patient ID {appt_data['patientId']} with doctor ID {appt_data['doctorId']}")
#             else:
#                 print(f"Appointment for patient ID {appt_data['patientId']} already exists")

#         # --- Seed Medical History ---
#         test_medical_histories = [
#             {
#                 "patientId": patient1.id,
#                 "diagnosis": "Flu",
#                 "treatment": "Rest and hydration",
#                 "date": datetime.fromisoformat("2025-01-01T00:00:00+00:00")
#             },
#             {
#                 "patientId": patient2.id,
#                 "diagnosis": "Migraine",
#                 "treatment": "Pain relief medication",
#                 "date": datetime.fromisoformat("2025-02-01T00:00:00+00:00")
#             }
#         ]

#         for history_data in test_medical_histories:
#             existing_history = await prisma.medicalhistory.find_first(
#                 where={
#                     "patientId": history_data["patientId"],
#                     "diagnosis": history_data["diagnosis"],
#                     "date": history_data["date"]
#                 }
#             )
#             if not existing_history:
#                 history = await prisma.medicalhistory.create(data=history_data)
#                 print(f"Created medical history for patient ID {history_data['patientId']}")
#             else:
#                 print(f"Medical history for patient ID {history_data['patientId']} already exists")

#         print("Database seeding completed successfully!")

#     except Exception as e:
#         print(f"Error seeding database: {e}")
        
#     finally:
#         await prisma.disconnect()

# if __name__ == "__main__":
#     asyncio.run(seed_database())