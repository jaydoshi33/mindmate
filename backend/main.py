from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Allow frontend calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace * with specific domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class JournalEntry(BaseModel):
    text: str

@app.get("/")
def root():
    return {"message": "MindMate backend is running!"}

@app.post("/journal")
def submit_journal(entry: JournalEntry):
    # For now, just echo back the journal length
    length = len(entry.text)
    return {"message": f"Received journal with {length} characters."}