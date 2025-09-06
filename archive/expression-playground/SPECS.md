# Expression Webcam Playground — Specs (Team 33)

Goal: Replicate the Hume Platform webcam playground for real-time facial expression measurement in the browser.

Last updated: 2025-09-06

## 1) User-facing features
- Webcam preview with start/stop controls; permission prompt on first use.
- Real-time expression overlays:
  - Top-K expressions with scores (e.g., 48-dim facial expression space).
  - Optional FACS/AU overlays (if enabled in model config).
  - Simple chart/time series of selected expressions (rolling ~10–30s).
- Connection state indicator (Connecting / Streaming / Error / Reconnecting).
- Option to toggle:
  - Model modalities: face (primary), optionally language/prosody if audio is added later.
  - Frame rate / sampling interval to control bandwidth.
  - Show raw JSON vs simplified UI labels.

## 2) Architecture (browser-first)
- Next.js app (running at http://localhost:3000 in dev).
- Browser captures webcam video via `navigator.mediaDevices.getUserMedia`.
- Frames sampled to Canvas, encoded (JPEG/WebP/PNG) and sent over WebSocket to Hume Expression Measurement Streaming API via the `hume` TypeScript SDK.
- Responses streamed back per frame with expression scores.
- UI renders:
  - Current Top-K labels+scores.
  - Optional sparkline/time-series.
  - Status toasts for auth/connection errors.

Note: Two connection options
1) Direct browser -> Hume WebSocket (simple, requires `NEXT_PUBLIC_HUME_API_KEY`).
2) Proxy via Next.js API route (pages/api/ws.js) where server injects API/secret keys. This avoids exposing secrets and enables custom throttling; the browser connects to the proxy at `NEXT_PUBLIC_WS_URL`.

## 3) APIs and SDKs
- SDK: `hume` (TypeScript SDK; npm i hume) — supports Expression Measurement streaming and batch.
- Streaming API: Expression Measurement WebSocket.
  - Connect via SDK: `hume.expressionMeasurement.stream.connect({ config: { face: { facs: true? }, }, } )` (schema per docs).
  - Request per frame: send binary/image payloads; for text/audio modalities, use respective send methods.
  - Response: scores per expression (48 facial dims), optional FACS/AU if enabled.
- Auth:
  - API Key required. Some streaming endpoints or EVI require secret key as well; for face-only expression streaming, API key is sufficient when using SDK in browser (confirm with current SDK capabilities and CORS policy).
  - If using a server proxy, keep `HUME_API_KEY` and `HUME_SECRET_KEY` only on the server.

References
- Web SDK/TS SDK: https://www.npmjs.com/package/hume
- Expression Measurement overview: https://dev.hume.ai/docs/expression-measurement/overview
- Streaming API reference (general): https://docs.hume.ai/reference/streaming-api
- Expression Measurement streaming connect (conceptual): https://dev.hume.ai/reference/expression-measurement-api/stream/connect

## 4) Data model (simplified)
Response (per frame), simplified example:
```json
{
  "type": "face_predictions",
  "timestamp": 1694020000,
  "predictions": [
    {
      "expressions": [
        { "name": "Joy", "score": 0.74 },
        { "name": "Calmness", "score": 0.41 },
        { "name": "Concentration", "score": 0.35 }
      ],
      "facs": [
        { "name": "AU12 (Lip corner pull)", "score": 0.66 }
      ]
    }
  ]
}
```
Notes:
- Exact schema follows Hume docs (48 expression dims for face; optional FACS/AU arrays). Keep UI decoupled from exact field names by mapping to a normalized interface.

## 5) Controls & defaults
- Default model config: `face: { facs: false }` (toggle in UI). 48-dim expressions enabled by default.
- Sampling: 8–12 FPS effective (send every ~80–120ms) to balance latency and bandwidth.
- Image encoding: JPEG/WebP at ~0.5–0.7 quality. Target <200KB per frame.
- Top-K: show top 3 expressions with score bars.
- Time window: 15s rolling chart for selected expressions.

## 6) Error handling & reconnect
- Handle mic/camera permission errors with a clear retry prompt.
- Detect WebSocket open/close/error; exponential backoff on reconnect (0.5s, 1s, 2s, cap 10s).
- Backpressure: if send queue grows, drop frames (keep latest) rather than piling up.
- Show toast/banner when rate-limited (429) or unauthorized (401).

## 7) Privacy & security
- If connecting directly from browser to Hume, the API key is exposed to the client; rotate and scope keys accordingly.
- Prefer proxy approach for production; never ship secret keys to the client.
- Do not store or upload video; process in-memory only. Document any logging.

## 8) Non-functional requirements
- Latency: target <300ms capture-to-render per frame.
- Stability: runs continuously for a 5–10 min demo without memory bloat.
- Responsive: works on laptop webcams (720p); autoscale canvas to container.
- Accessibility: start/stop via keyboard, visible status indicators.

## 9) Minimal UI spec
- Layout: left video preview, right panel with top-K and chart; status bar on top.
- Buttons: Start camera, Stop camera, Connect, Disconnect, Toggle FACS.
- Indicators: Green (Streaming), Yellow (Connecting), Red (Error/Disconnected).

## 10) Env & setup
- Required env (dev):
  - `NEXT_PUBLIC_HUME_API_KEY` (direct connect) OR
  - `HUME_API_KEY` + `HUME_SECRET_KEY` and `NEXT_PUBLIC_WS_URL` (proxy route).
- Dev: `npm i` then `npm run dev` in `expression-playground/`.

## 11) Open questions (to verify during implementation)
- Exact WebSocket message schema for sending images in-browser via SDK (Blob/ArrayBuffer vs base64) and event types in responses.
- Whether face streaming requires secret key in browser contexts or if API key alone suffices.
- Model flags for FACS output and bounding boxes / face landmarks availability in streaming mode.
- Rate limits and recommended frame size for webcams in the playground.

## 12) Nice-to-haves (post-MVP)
- Record short clips for offline analysis (user opt-in only).
- Download JSON of the last N seconds for debugging.
- Multi-person detection and bounding boxes per face.
- Save preset toggle profiles (e.g., Low Bandwidth mode vs High Fidelity).
