#from openai import OpenAI
import cohere
from dotenv import load_dotenv
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline, T5Tokenizer, T5ForConditionalGeneration

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
t5_tokenizer = T5Tokenizer.from_pretrained("t5-base")
t5_model = T5ForConditionalGeneration.from_pretrained("t5-base")


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
        

    return {
        "sentiment": sentiment_result,
        "emotion": emotion_result,
        "affirmation": affirmation
    }
