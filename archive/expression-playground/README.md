# Playground Webapp for Real-Time Expression Measurement

This app allows users to turn on their webcam, stream video frames in real time, and visualize expression measurement results using the Hume API.

## Features
- Real-time webcam streaming
- WebSocket connection to backend
- Real-time expression measurement results
- Reference implementation based on existing examples in this repo

## Getting Started

### 1. Get Your Hume API Key
- Sign up at [https://beta.hume.ai](https://beta.hume.ai)
- Get your API key from the dashboard

### 2. Set up environment variables
1. Copy the example environment file:
   ```sh
   cp .env.example .env.local
   ```
2. Edit `.env.local` and add your actual Hume API key:
   ```
   # Used by the browser to connect directly to Hume Streaming
   NEXT_PUBLIC_HUME_API_KEY=your_actual_api_key_here
   # (Optional) If using the local proxy in pages/api/ws.js instead of direct connect
   HUME_API_KEY=your_actual_api_key_here
   HUME_SECRET_KEY=your_actual_secret_here
   NEXT_PUBLIC_WS_URL=ws://localhost:3000/api/ws
   ```

### 3. Install dependencies
   ```sh
   npm install
   ```

### 4. Run the development server
   ```sh
   npm run dev
   ```

## Reference Examples
- [streaming/next-js-streaming-example](../streaming/next-js-streaming-example)
- [batch/next-js-emotional-language](../batch/next-js-emotional-language)
- [visualization-example/example-notebook.ipynb](../visualization-example/example-notebook.ipynb)
