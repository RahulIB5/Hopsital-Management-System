import asyncio
import sys
from passlib.context import CryptContext
from prisma import Prisma

# Initialize password hasher
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def seed_users():
    # Connect to the database
    prisma = Prisma()
    await prisma.connect()

    try:
        # List of test users to create
        test_users = [
            {
                "email": "admin@healthcare.com",
                "password": pwd_context.hash("admin123"),
                "role": "admin"
            },
            {
                "email": "doctor@healthcare.com",
                "password": pwd_context.hash("doctor123"),
                "role": "doctor"
            },
            {
                "email": "nurse@healthcare.com",
                "password": pwd_context.hash("nurse123"),
                "role": "nurse"
            },
            {
                "email": "test@healthcare.com",
                "password": pwd_context.hash("test123"),
                "role": "user"
            }
        ]

        # Create each user if they don't already exist
        for user_data in test_users:
            existing_user = await prisma.user.find_unique(
                where={"email": user_data["email"]}
            )
            
            if not existing_user:
                await prisma.user.create(data=user_data)
                print(f"Created user: {user_data['email']} with role: {user_data['role']}")
            else:
                print(f"User {user_data['email']} already exists")

        print("Database seeding completed successfully!")

    except Exception as e:
        print(f"Error seeding database: {e}")
        
    finally:
        # Disconnect from the database
        await prisma.disconnect()

if __name__ == "__main__":
    asyncio.run(seed_users())