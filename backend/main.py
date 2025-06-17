from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline

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

# Load HuggingFace models (once at startup)
sentiment_model = pipeline("sentiment-analysis", model="finiteautomata/bertweet-base-sentiment-analysis" )
emotion_model = pipeline("text-classification", model="j-hartmann/emotion-english-distilroberta-base", return_all_scores=True)


@app.get("/")
def root():
    return {"message": "MindMate backend is running!"}

@app.post("/journal")
def analyze_journal(entry: JournalEntry):
    text = entry.text

    #Analyze sentiment
    sentiment_result = sentiment_model(text)[0]

    # Analyze emotion (pick the highest scored emotion)
    emotion_scores = emotion_model(text)[0]
    emotion_result = max(emotion_scores, key=lambda x: x['score'])

    return {
        "sentiment": sentiment_result,
        "emotion": emotion_result
    }