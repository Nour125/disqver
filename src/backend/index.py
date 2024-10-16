from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

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


# Define a simple route to test the API
@app.get("/")
def read_root():
    return {"message": "Hello World"}


# Define a POST route for creating an item
@app.post("/items/")
def create_item(item: Item):
    return {"item": item}
