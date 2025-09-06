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
    """Test the analyze endpoint with mock user message and hume data"""
    print("\nTesting analyze endpoint...")
    
    # Mock data with user_message and hume_data structure
    mock_data = {
        "user_message": "Hello, I'm testing the autism assessment system. How are you doing today?",
        "hume_data": {
            "facial_expressions": [
                {"joy": 0.8, "sadness": 0.1, "anger": 0.05, "fear": 0.05},
                {"joy": 0.6, "sadness": 0.2, "anger": 0.1, "fear": 0.1},
                {"joy": 0.9, "sadness": 0.05, "anger": 0.02, "fear": 0.03}
            ],
            "audio_features": {
                "pitch_mean": 150.5,
                "pitch_std": 25.3,
                "volume_mean": 0.7,
                "speech_rate": 3.2
            },
            "timestamp": datetime.now().isoformat(),
            "video_duration": 120
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