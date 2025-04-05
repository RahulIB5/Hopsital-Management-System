from fastapi import FastAPI
import uvicorn

app = FastAPI()

# Basic app. will be changed later

@app.get("/")
def read_root():
    return {"message": "Welcome to the FastAPI app!"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q}

@app.post("/items/")
def create_item(item: dict):
    return {"item": item}