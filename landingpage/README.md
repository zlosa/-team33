# Landingpage app

A Vite + React client served by an Express server with API routes. Dev server serves client and API on one port.

## Quick start (development)

- Already running task: Landingpage: Dev
- URL: http://localhost:5001
- Logs: check VS Code Tasks -> Landingpage: Dev

If you need to start it manually:

1. Install deps (once):
   npm ci || npm install
2. Start dev server (from repo root or landingpage/):
   cd landingpage && npm run dev

## Verify it's working
- Open http://localhost:5001 in a browser.
- API example: GET http://localhost:5001/api/sessions returns [] initially.

## Stop
- In VS Code, stop the "Landingpage: Dev" task, or Ctrl+C in terminal that runs it.

## Production build
1. Build client and bundle server:
   cd landingpage && npm run build
2. Start production server:
   npm run start
   (Serves from dist/public on PORT=5001 by default; set PORT to override.)

## Notes
- No external DB required: in-memory storage is used.
- PORT is read by server; default 5001.
