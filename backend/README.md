# Backend (FastAPI)

A small FastAPI service that proxies requests to Google Gemini to avoid exposing API keys in the frontend.

## Setup

1. Create a Python virtual environment and install dependencies:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. Create a `.env` file in `backend/`:

```
GEMINI_API_KEY=your_real_key_here
CORS_ORIGIN=http://localhost:5173
```

3. Run the server:

```bash
uvicorn main:app --reload --port 8000
```

## Endpoints

- `GET /health` – health check
- `POST /api/gemini/voice` – Accepts:

```json
{
  "command": "switch to solar",
  "language": "en-US",
  "currentMode": "grid",
  "availableModes": ["solar", "wind", "solar+wind", "solar+wind+grid", "grid"]
}
```

Returns

```json
{
  "mode": "solar",
  "confidence": 0.87,
  "explanation": "Detected 'switch to solar'"
}
```

## Notes
- The API key is kept on the server only. Never commit real keys to the repo.
- The service uses `google-genai` SDK under the hood.
- Adjust `CORS_ORIGIN` if your frontend runs on a different origin.
