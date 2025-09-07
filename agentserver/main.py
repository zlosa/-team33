from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models.flat_assessment import FlatAutismAssessment
from agents.analyzer import analyze
from datetime import datetime
from dotenv import load_dotenv
import uvicorn

load_dotenv()


app = FastAPI(title="Agent Server", description="Autism assessment analysis server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze", response_model=FlatAutismAssessment)
async def analyze_expressions(request: dict):
    print(f"🔄 Received analyze request at {datetime.now()}")

    conversation_data = request.get("conversation_data", {})
    hume_data = request.get("hume_data", {})

    print(f"💬 Conversation data keys: {list(conversation_data.keys())}")
    print(f"📊 Hume data keys: {list(hume_data.keys())}")
    print(f"📏 Total data size: {len(str(request))} chars")

    result = await analyze(conversation_data, hume_data)
    
    print(f"✅ Analysis complete - likelihood: {result.overall_autism_likelihood:.3f}")
    return result


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
