from openai import OpenAI
from dotenv import load_dotenv
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline

app = FastAPI()
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

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

    # Generate affirmation using OpenAI
    prompt = f"""You are a kind, empathetic mental health coach. A user just wrote the following journal entry: "{text}". They are feeling {emotion_result['label']}. Write a 1-sentence affirmation that is supportive and non-judgmental."""
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a mental health support assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=60
        )
        affirmation = response.choices[0].message.content.strip()
    except Exception as e:
        print("OpenAI Error:", e)  # 🔍 Add this line to see the actual error in terminal
        affirmation = "We're here for you. You're not alone."

    return {
        "sentiment": sentiment_result,
        "emotion": emotion_result,
        "affirmation": affirmation
    }
