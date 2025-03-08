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
    return get_last_uploaded_file()


# Define a Pydantic model for the overview data
class Overview(BaseModel):
    overviewdata: dict


# Define a GET route for the Overview data
@app.get("/overview/")
async def get_overview():
    return send_overview_data()


# Define a POST route for the Overview data
@app.post("/overview/")
async def create_overview(overview: Overview):
    overviewdata = overview.overviewdata
    return overviewdata


# Define a GET route for Sample data using the table name
@app.get("/uploadfile/{table_name}")
async def get_table(table_name: str):
    return get_table_data(table_name)


# Define a GET route for item types using the cp name
@app.get("/itemtypes/{collection_point}")
async def get_item_types_from_cp(collection_point: str):
    return get_item_types_by_cp(collection_point)


# define a pydantic model for the demand data
class Demand(BaseModel):
    item_names: list[str]
    collection_points: list[str]


# Define a GET route for Sample data using the table name
@app.post("/Demand/")
async def get_demand(demand: Demand):
    try:
        demandData = {}
        for cp in demand.collection_points:
            demandData.setdefault(cp, {})
            for item in demand.item_names:
                demandData[cp][item] = determin_demand_for_months(item, cp)
        return demandData
    except ValueError as e:
        # Return a 400 error with the error message
        raise HTTPException(status_code=400, detail=str(e))


# Define a GET route for qnet
@app.get("/qnet/")
async def get_qnet():
    try:
        # Get the data
        graphData, graph = get_qnet_data()

        # Convert data to dictionaries with proper datetime handling
        result = {
            "graph": graph,
            "graphData": graphData,
        }
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Define a Pydantic model for the request body
class UserInput(BaseModel):
    replenishment_Order: str
    register_Replenishment_Order: str
    placed_Replenishment_Order: str
    Customer_Order: str
    register_Customer_Order: str
    placed_Customer_Order: str
    collection_Point: dict


# define a POST route for the User Input


@app.post("/UserInput/")
async def create_user_input(userinput: UserInput):
    global userInputs
    userInputs = userinput
    return userInputs


# define a GET route for User Input
@app.get("/UserInput/")
async def get_user_input():
    return userInputs


# define a GET route for leadtime data
@app.get("/leadtime/{register_activity}/{placement_activity}")
async def get_leadtime(register_activity: str, placement_activity: str):
    try:
        # Get the data
        merged_ro, item_for_object, supplier_for_object = get_lead_time(
            register_activity, placement_activity
        )

        # Convert DataFrames to dictionaries with proper datetime handling
        result = {
            "lead_time_data": merged_ro,
            "item_data": item_for_object,
            "supplier_data": supplier_for_object,
        }

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# define a GET route for leadtime data
@app.get("/servicelevel/{register_activity}/{placement_activity}/{service_level_type}")
async def get_servicelevel(
    register_activity: str, placement_activity: str, service_level_type: str
):
    try:
        ra = register_activity
        pa = placement_activity
        if ra == userInputs.register_Replenishment_Order:
            ot = userInputs.replenishment_Order
        else:
            ot = userInputs.Customer_Order
        pla_cp = [
            key
            for key, value in userInputs.collection_Point.items()
            if value["type"] == "Planning"
        ]
        phy_cp = [
            key
            for key, value in userInputs.collection_Point.items()
            if value["type"] == "Physical"
            and "planningPartner" in value
            and value["planningPartner"] in pla_cp
        ]
        slt = service_level_type
        print(ot, ra, pa, pla_cp, phy_cp, slt)
        if not pla_cp or not phy_cp:
            raise HTTPException(
                status_code=400, detail="No valid collection points found."
            )
        return get_service_level(slt, ra, pa, pla_cp[0], phy_cp[0], ot)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class Qstate(BaseModel):
    item_names: list[str]
    collection_points: list[str]


# define a post route for qstate data
@app.post("/qstate/")
async def get_qstate(qstate: Qstate):
    try:
        qstateData = {}
        for cp in qstate.collection_points:
            qstateData.setdefault(cp, {})
            temp = get_quantity_state(cp)
            qstateData[cp] = temp[
                ["Time"] + [item for item in qstate.item_names if item in temp.columns]
            ]

        return qstateData
    except ValueError as e:
        # Return a 400 error with the error message
        raise HTTPException(status_code=400, detail=str(e))
