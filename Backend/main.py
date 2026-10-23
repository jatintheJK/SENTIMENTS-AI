from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from textblob import TextBlob
from pymongo import MongoClient

app = FastAPI()

# Yeh 4 lines CORS ki problem permanently solve karti hain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
client = MongoClient("mongodb+srv://madmax4kk_db_user:ghKBPxgyAtstyW8q@cluster0.ltldrmp.mongodb.net/")
db = client["sentiment_db"]
collection = db["results"]

class TextInput(BaseModel):
    text: str

@app.post("/analyze")
def analyze(data: TextInput):
    polarity = TextBlob(data.text).sentiment.polarity
    if polarity > 0.1:
        sentiment = "Positive"
    elif polarity < -0.1:
        sentiment = "Negative"
    else:
        sentiment = "Neutral"
    
    result = {"text": data.text, "sentiment": sentiment, "polarity": polarity}
    collection.insert_one(result)
    return {"sentiment": sentiment, "polarity": polarity}