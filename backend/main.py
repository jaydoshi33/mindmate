#from openai import OpenAI
from typing import List
from fastapi.responses import JSONResponse
from database import SessionLocal
from models import JournalEntry as JournalEntryModel
from sqlalchemy import select, and_, func, cast, Date
from sqlalchemy.ext.asyncio import AsyncSession
import cohere
from dotenv import load_dotenv
import os
from fastapi import FastAPI, Depends, Query, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline
from datetime import datetime
from typing import Optional


app = FastAPI()
load_dotenv()
# client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
co = cohere.Client(os.getenv("COHERE_API_KEY"))

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

# Load HuggingFace models (once at startup)
sentiment_model = pipeline("sentiment-analysis", model="finiteautomata/bertweet-base-sentiment-analysis" )
emotion_model = pipeline("text-classification", model="j-hartmann/emotion-english-distilroberta-base", return_all_scores=True)


@app.get("/")
def root():
    return {"message": "MindMate backend is running!"}

# Dependency to get DB session
async def get_db():
    async with SessionLocal() as session:
        yield session

@app.post("/journal")
async def analyze_journal(entry: JournalEntry, db: AsyncSession = Depends(get_db)):
    text = entry.text

    #Analyze sentiment
    sentiment_result = sentiment_model(text)[0]

    # Analyze emotion (pick the highest scored emotion)
    emotion_scores = emotion_model(text)[0]
    emotion_result = max(emotion_scores, key=lambda x: x['score'])

    # Generate affirmation using Cohere
    prompt = f"You are a kind and supportive mental health assistant. Write a 1-line affirmation for someone who feels {emotion_result['label']}. Their journal entry: \"{text}\""
    try:
        response = co.generate(
            model="command-r-plus",  # You can also try "command-r-plus"
            prompt=prompt,
            max_tokens=60,
            temperature=0.8
        )
        affirmation = response.generations[0].text.strip()
    except Exception as e:
        print("Cohere Error:", e)
        affirmation = "We're here for you. You're not alone."
        
    # Save to DB
    new_entry = JournalEntryModel(
        text=text,
        sentiment=sentiment_result['label'],
        emotion=emotion_result['label'],
        affirmation=affirmation
    )
    db.add(new_entry)
    await db.commit()

    return {
        "sentiment": sentiment_result,
        "emotion": emotion_result,
        "affirmation": affirmation
    }

@app.get("/journal-history")
async def get_journal_history(
    db: AsyncSession = Depends(get_db),
    #get the optional parameters from request
    emotion: Optional[str] = Query(None),
    sentiment: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
    ):

    filters = []
    if emotion:
        filters.append(JournalEntryModel.emotion == emotion)
    if sentiment:
        filters.append(JournalEntryModel.sentiment == sentiment)
    if start_date:
        try:
            start = datetime.fromisoformat(start_date)
            filters.append(JournalEntryModel.timestamp >= start)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format, use YYYY-MM-DD")

    if end_date:
        try:
            end = datetime.fromisoformat(end_date)
            filters.append(JournalEntryModel.timestamp <= end)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format, use YYYY-MM-DD")


    # Query the DB
    query = select(JournalEntryModel).order_by(JournalEntryModel.id.desc())
    if filters:
        query = query.where(and_(*filters))

    result = await db.execute(query)
    entries = result.scalars().all()
    
    # Convert to dict to return as JSON
    return JSONResponse([
        {
            "id": entry.id,
            "text": entry.text,
            "sentiment": entry.sentiment,
            "emotion": entry.emotion,
            "affirmation": entry.affirmation,
            "timestamp": entry.timestamp.isoformat() if entry.timestamp else None
        }
        for entry in entries
    ])

@app.get("/journal-insights")
async def get_journal_insights(db: AsyncSession = Depends(get_db)):
    # Count by emotion
    emotion_result = await db.execute(select(JournalEntryModel.emotion, func.count()).group_by(JournalEntryModel.emotion))
    emotion_counts = {row[0]: row[1] for row in emotion_result if row[0] is not None}
    
    # Count by sentiment
    sentiment_result = await db.execute(select(JournalEntryModel.sentiment, func.count()).group_by(JournalEntryModel.sentiment))
    sentiment_counts = {row[0]: row[1] for row in sentiment_result if row[0] is not None}

    # Get entries per day (timeline trend)
    # First, get all timestamps and process them in Python
    entries = await db.execute(select(JournalEntryModel.timestamp))
    
    # Group by date and count entries per day
    from collections import defaultdict
    from datetime import datetime
    date_counts = defaultdict(int)
    
    for row in entries.all():
        timestamp = row[0]  # Get the timestamp from the row
        if timestamp is not None:  # Ensure timestamp is not None
            if isinstance(timestamp, datetime):
                date_str = timestamp.date().isoformat()
                date_counts[date_str] += 1
    
    # Convert to the expected format
    timeline = [{"date": date, "count": count} for date, count in sorted(date_counts.items())]
    
    return {
        "emotion_counts": emotion_counts,
        "sentiment_counts": sentiment_counts,
        "timeline": timeline
    }

@app.delete("/journal/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_journal_entry(entry_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(JournalEntryModel).where(JournalEntryModel.id == entry_id))
    entry = result.scalar_one_or_none()
    
    if entry is None:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    await db.delete(entry)
    await db.commit()
    return None
