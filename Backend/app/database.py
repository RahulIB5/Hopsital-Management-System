from prisma import Prisma

async def get_db():
    db = Prisma(log_queries=True)
    await db.connect()
    try:
        yield db
    finally:
        await db.disconnect()