from pydantic import BaseModel
from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from typing import List, Dict
import os
from analysis import *


app = FastAPI()

# Allow specific origins (such as your React app's URL)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Define a Pydantic model for the request body
class Item(BaseModel):
    name: str
    description: str = None


# In-memory storage
items = []
overviewdata = {}


# Define a simple route to test the API
@app.get("/")
def read_root():
    return {"message": "Hello World"}


# Define a POST route for creating an item
@app.post("/items/")
def create_item(item: Item):
    items.append(item)
    return {"item": item}


# Define a GET route for fetching all items
@app.get("/items/")
def get_items():
    return items


# Define a POST route for uploading a file
@app.post("/uploadfile/")
async def upload_file(file: UploadFile = File(...)):
    file_location = r"src\backend\files"
    # Check if the 'src/backend/files' directory exists
    if not os.path.exists(r"src\backend\files"):
        return {"error": "The target directory 'files' does not exist."}
    with open((file_location + "\\" + file.filename), "wb") as f:
        f.write(await file.read())

    return {"info": f"file '{file.filename}' saved at '{file_location}'"}


# Define a GET route for retrieving uploaded files
@app.get("/uploadfile/")
async def get_uploaded_file():
    directory = r"src\backend\files"
    if not os.path.exists(directory):
        print(os.getcwd())
        raise HTTPException(status_code=404, detail="Directory not found")

    files = os.listdir(directory)
    if not files:
        raise HTTPException(status_code=404, detail="No files found")

    return {files[-1]}


# Define a Pydantic model for the overview data
class Overview(BaseModel):
    overviewdata: dict


# Define a GET route for the Overview data
@app.get("/overview/")
async def get_overview():
    return overview


# Define a POST route for the Overview data
@app.post("/overview/")
async def create_overview(overview: Overview):
    overviewdata = overview.overviewdata
    return overviewdata
