# Local Backend

Run the app and API locally:

```bash
npm run local
```

Open:

```text
http://localhost:3000
```

The local server:

- serves the built React app from `dist/`
- loads `.env.local`
- exposes `POST /api/score`
- exposes `POST /api/transcribe` only when `OPENAI_API_KEY` is configured

## Environment

Copy `.env.example` to `.env.local` and set:

```text
DEEPSEEK_API_KEY=...
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
```

`.env.local` is ignored by git.

## DeepSeek Scoring

DeepSeek is used for OPIC rubric scoring from transcript text:

- Global Tasks and Functions
- Context / Content
- Text Type
- Accuracy

DeepSeek does not transcribe audio. The browser currently creates the transcript with Chrome Web Speech. If transcript is unavailable, the app falls back to local heuristic scoring.

For server-side audio transcription, configure `OPENAI_API_KEY` and use `/api/transcribe`, or add another speech-to-text provider later.
