from prisma import Prisma

async def test_connection():
    db = Prisma()
    try:
        await db.connect()
        print("Database connection successful")
    except Exception as e:
        print(f"Database connection failed: {e}")
    finally:
        await db.disconnect()

import asyncio
asyncio.run(test_connection())