#!/usr/bin/env python3

import requests
import json
from datetime import datetime

def test_health_endpoint():
    """Test the health endpoint"""
    print("Testing health endpoint...")
    try:
        response = requests.get("http://localhost:8000/health")
        print(f"Health Status: {response.status_code}")
        print(f"Health Response: {response.json()}")
        return response.status_code == 200
    except requests.exceptions.ConnectionError:
        print("❌ Server not running on localhost:8000")
        return False
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_analyze_endpoint():
    """Test the analyze endpoint with mock conversation and emotion timeline data"""
    print("\nTesting analyze endpoint...")
    
    # Mock data following the architecture diagram structure
    mock_data = {
        "user_message": "Structured AI agent interview data",
        "hume_data": {
            "session_id": "interview_session_456",
            "conversation_data": {
                "session_id": "interview_session_456",
                "transcript": [
                    {
                        "timestamp": 0,
                        "speaker": "agent",
                        "text": "Hello! I'd like to ask you some questions about your daily experiences. How do you usually feel in social situations?",
                        "confidence": 0.95
                    },
                    {
                        "timestamp": 3.2,
                        "speaker": "user", 
                        "text": "I find them quite overwhelming sometimes. Too many people talking at once makes it hard to focus.",
                        "confidence": 0.92
                    },
                    {
                        "timestamp": 8.7,
                        "speaker": "agent",
                        "text": "That's interesting. Can you tell me more about what specifically feels overwhelming?",
                        "confidence": 0.94
                    },
                    {
                        "timestamp": 11.1,
                        "speaker": "user",
                        "text": "The sounds, the different conversations happening... I prefer smaller groups or one-on-one conversations.",
                        "confidence": 0.89
                    }
                ],
                "duration": 15.5,
                "start_time": datetime.now().isoformat(),
                "end_time": (datetime.now()).isoformat()
            },
            "emotion_timeline": {
                "session_id": "interview_session_456",
                "face_emotions": [
                    {
                        "timestamp": 0,
                        "emotions": [{"Joy": 0.3, "Neutral": 0.6, "Confusion": 0.1}],
                        "confidence": 0.85
                    },
                    {
                        "timestamp": 3.2,
                        "emotions": [{"Anxiety": 0.4, "Neutral": 0.4, "Sadness": 0.2}],
                        "confidence": 0.82
                    },
                    {
                        "timestamp": 8.7,
                        "emotions": [{"Concentration": 0.5, "Neutral": 0.4, "Anxiety": 0.1}],
                        "confidence": 0.87
                    },
                    {
                        "timestamp": 11.1,
                        "emotions": [{"Relief": 0.6, "Neutral": 0.3, "Joy": 0.1}],
                        "confidence": 0.84
                    }
                ],
                "prosody_emotions": [
                    {
                        "timestamp": 3.2,
                        "emotions": [{"Stress": 0.3, "Hesitation": 0.4, "Calmness": 0.3}],
                        "confidence": 0.78
                    },
                    {
                        "timestamp": 11.1,
                        "emotions": [{"Confidence": 0.5, "Calmness": 0.4, "Relief": 0.1}],
                        "confidence": 0.81
                    }
                ],
                "burst_analysis": [
                    {
                        "timestamp": 4.5,
                        "burst_type": "Sigh",
                        "intensity": 0.6,
                        "confidence": 0.73
                    },
                    {
                        "timestamp": 12.0,
                        "burst_type": "Breath",
                        "intensity": 0.3,
                        "confidence": 0.68
                    }
                ]
            }
        }
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/analyze",
            json=mock_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Analyze Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Analysis successful!")
            print(f"Overall autism likelihood: {result['aggregate_scores']['overall_autism_likelihood']:.3f}")
            print(f"Professional evaluation priority: {result['recommendations']['professional_evaluation_priority']}")
            print(f"Confidence: {result['uncertainty_analysis']['overall_confidence']:.3f}")
            return True
        else:
            print(f"❌ Analysis failed: {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Analyze test failed: {e}")
        return False

def main():
    print("🚀 Testing Agent Server API")
    print("=" * 40)
    
    # Test health first
    health_ok = test_health_endpoint()
    
    if health_ok:
        # Test analyze endpoint
        analyze_ok = test_analyze_endpoint()
        
        if analyze_ok:
            print("\n✅ All tests passed!")
        else:
            print("\n❌ Analyze endpoint failed")
    else:
        print("\n❌ Server not responding. Make sure to run:")
        print("   cd agentserver && python main.py")

if __name__ == "__main__":
    main()