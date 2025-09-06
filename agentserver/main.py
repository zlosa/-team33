from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models.assessment import AutismAssessmentResponse
from agents.analyzer import analyze_facial_expressions
from datetime import datetime
import uvicorn


app = FastAPI(title="Agent Server", description="Autism assessment analysis server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze", response_model=AutismAssessmentResponse)
async def analyze_expressions(request: dict):
    print(f"🔄 Received analyze request at {datetime.now()}")
    
    user_message = request.get("user_message", "")
    hume_data = request.get("hume_data", {})
    
    print(f"💬 User message: {user_message[:100]}...")
    print(f"📊 Hume data keys: {list(hume_data.keys())}")
    print(f"📏 Total data size: {len(str(request))} chars")
    
    result = analyze_facial_expressions(user_message, hume_data)
    
    print(f"✅ Analysis complete - likelihood: {result.aggregate_scores.overall_autism_likelihood:.3f}")
    return result


@app.post("/multimodal", response_model=AutismAssessmentResponse)
async def analyze_multimodal(request: dict):
    """Preferred endpoint: analyze multimodal inputs (face/audio/text)"""
    print(f"🔄 Received multimodal request at {datetime.now()}")

    user_message = request.get("user_message", "")
    hume_data = request.get("hume_data", {})

    print(f"💬 User message: {user_message[:100]}...")
    print(f"📊 Hume data keys: {list(hume_data.keys())}")
    print(f"📏 Total data size: {len(str(request))} chars")

    result = analyze_facial_expressions(user_message, hume_data)

    print(f"✅ Multimodal analysis complete - likelihood: {result.aggregate_scores.overall_autism_likelihood:.3f}")
    return result

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)