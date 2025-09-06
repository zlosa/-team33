from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime


class FacialExpressionData(BaseModel):
    emotions: List[Dict[str, float]]
    predictions: Optional[List[Dict[str, Any]]] = None
    bbox: Optional[Dict[str, float]] = None
    timestamp: Optional[str] = None


class SpeechProsodyData(BaseModel):
    prosody: Dict[str, float]
    predictions: Optional[List[Dict[str, Any]]] = None
    timestamp: Optional[str] = None


class VocalBurstData(BaseModel):
    burst: Dict[str, float]
    predictions: Optional[List[Dict[str, Any]]] = None
    timestamp: Optional[str] = None


class HumeMultiModalData(BaseModel):
    facial_expressions: Optional[FacialExpressionData] = None
    speech_prosody: Optional[SpeechProsodyData] = None
    vocal_burst: Optional[VocalBurstData] = None
    session_id: Optional[str] = None
    timestamp: Optional[datetime] = None


class AnalyzeRequest(BaseModel):
    user_message: str
    hume_data: HumeMultiModalData
