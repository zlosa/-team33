# TODO — Low-Risk Integration Steps

These tasks focus on safe, incremental changes that won’t alter existing Hume streaming behavior or break the current demo. Items are organized by area and designed to be gated behind flags or added in a way that remains unused until explicitly enabled.

## Frontend (Next.js)

- [ ] Add optional callbacks to surface predictions (no-op defaults):
  - Face: add `onPrediction?: (data) => void` and call it where predictions are processed (`next-js-streaming-example/components/widgets/FaceWidgets.tsx:90–121`).
  - Language: add `onPrediction?: (data) => void` alongside existing send (`next-js-streaming-example/components/widgets/LanguageWidgets.tsx:54–73`).
  - Audio: keep existing `onTimeline` as-is (`next-js-streaming-example/components/widgets/AudioWidgets.tsx:16, 88–91`).

- [ ] Add minimal, unused collector state to Multi-Model page:
  - Store face/prosody/burst predictions with timestamps in `next-js-streaming-example/pages/multimodel/index.tsx:5`.
  - Do not change rendering yet; only collect in memory.

- [ ] Add “Analyze” button gated by `NEXT_PUBLIC_ENABLE_ANALYZE` (default false):
  - When enabled, package `{ user_message, hume_data }` and POST to backend client.
  - Keep disabled by default to avoid behavior changes.

- [ ] Debounce language send (optional, behind `NEXT_PUBLIC_DEBOUNCE_LANGUAGE`):
  - Apply a 250–400ms debounce before `socket.send` in `LanguageWidgets`.

- [ ] Unify reconnect logic (consistency only):
  - Use the same comparison (e.g., `>= maxReconnects`) in Face/Audio/Language widgets before calling `stopEverything()`.

## Backend Integration

- [ ] Add `NEXT_PUBLIC_AGENTSERVER_URL` to a new `next-js-streaming-example/.env.example` (no code path uses it until flag is enabled).

- [ ] Add `lib/backend/client.ts` with a `postAnalyze({ user_message, hume_data })` helper using `fetch`:
  - Keep the file unused until `Analyze` is enabled.

- [ ] Optional: Add `pages/api/analyze.ts` proxy that forwards to `agentserver` (kept unused by default). This simplifies CORS and deploys cleanly.

## Security & Config Hygiene

- [ ] Replace committed sample keys with placeholders:
  - Create `next-js-streaming-example/.env.example` and move public variables there.
  - Ensure `.env.local` stays in `.gitignore` (already covered in `next-js-streaming-example/.gitignore`).
  - Consider rotating any real keys committed in history.

- [ ] Document backend env requirements:
  - Add `OPENAI_API_KEY` requirement for `agentserver` in a short README or `.env.example`.

## Documentation

- [ ] Update `next-js-streaming-example/docs/architecture-diagram.md` to reference `NEXT_PUBLIC_AGENTSERVER_URL` and note the Analyze flow is feature-gated.

- [ ] Add a “How to enable backend analysis” section in `next-js-streaming-example/README.md` describing flags and steps.

## Non-Goals / Deferred (higher risk)

- [ ] Do not modify current Hume WebSocket endpoints or behavior.
- [ ] Do not wire transcript capture until UI/UX supports it.
- [ ] No refactors to media/recorder utilities or socket lifecycle beyond the optional, gated debounce/consistency tweaks above.

