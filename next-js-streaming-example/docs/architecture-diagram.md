# Voice AI Agent Architecture with Autism Analysis

## System Architecture Diagram

```mermaid
graph TB
    %% Frontend Components
    subgraph "Frontend (Next.js)"
        A[Voice AI Agent Interface]
        B[Audio/Video Recording]
        C[Hume AI Integration]
        D[Data Collection & Timestamps]
        E[Results Display]
    end

    %% External Services
    subgraph "External Services"
        F[Voice AI Agent API]
        G[Hume AI WebSocket]
    end

    %% Backend Services
    subgraph "Backend (FastAPI)"
        H[Analysis Endpoint]
        I[Autism Scoring Engine]
        J[Data Processing]
    end

    %% User Flow
    User((User)) --> A
    A --> B
    B --> F
    B --> C
    C --> G
    
    %% Data Collection
    F --> D
    G --> D
    
    %% Send to Backend
    D --> H
    
    %% Analysis & Response
    H --> J
    J --> I
    I --> H
    H --> E
    E --> User

    %% Styling
    classDef frontend fill:#e1f5fe
    classDef backend fill:#f3e5f5
    classDef external fill:#fff3e0
    
    class A,B,C,D,E frontend
    class H,I,J backend
    class F,G external
```

## Simplified Flow Description

### Step 1: Interview & Data Collection
1. **Voice AI Agent Interview**: User interacts with AI agent for structured conversation
2. **Multi-Modal Recording**: Capture audio/video with real-time Hume AI emotion analysis
3. **Timestamped Collection**: Collect conversation transcript + emotion data with timestamps

### Step 2: Send to Backend
1. **Data Package**: Frontend packages conversation data + Hume emotion timeline
2. **POST to /analyze**: Single API call sends all collected data to backend

### Step 3: Analysis & Response
1. **Process Data**: Backend processes conversation + emotion patterns
2. **Generate Score**: Autism scoring engine calculates likelihood score
3. **Return Results**: Backend responds with analysis results and statistics
4. **Display Results**: Frontend shows autism score and insights to user

## Data Models

### Conversation Data
```typescript
interface ConversationData {
  sessionId: string;
  transcript: TranscriptSegment[];
  duration: number;
  startTime: Date;
  endTime: Date;
}

interface TranscriptSegment {
  timestamp: number;
  speaker: 'user' | 'agent';
  text: string;
  confidence: number;
}
```

### Emotion Timeline
```typescript
interface EmotionTimeline {
  sessionId: string;
  faceEmotions: TimestampedEmotion[];
  prosodyEmotions: TimestampedEmotion[];
  burstAnalysis: VocalBurst[];
}

interface TimestampedEmotion {
  timestamp: number;
  emotions: Emotion[];
  confidence: number;
}
```

### Analysis Results
```typescript
interface AutismAnalysisResult {
  sessionId: string;
  overallScore: number;
  confidence: number;
  indicators: {
    socialCommunication: number;
    restrictedInterests: number;
    sensoryProcessing: number;
    emotionalRegulation: number;
  };
  timeline: AnalysisPoint[];
  recommendations: string[];
}
```
