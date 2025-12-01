import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

try:
    from google import genai
except Exception as e:
    genai = None


class VoiceCommandRequest(BaseModel):
    command: str
    language: str
    currentMode: str
    availableModes: list[str]


class GeminiResponse(BaseModel):
    mode: str | None
    confidence: float
    explanation: str


app = FastAPI(title="SIH25210 Backend", version="1.0.0")

# CORS: allow frontend dev server
origins = [
    os.getenv("CORS_ORIGIN", "http://localhost:5173"),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/gemini/voice", response_model=GeminiResponse)
def gemini_voice(req: VoiceCommandRequest):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not set")
    if genai is None:
        raise HTTPException(status_code=500, detail="google-genai not available")

    client = genai.Client(api_key=api_key)

    prompt = f'''
You are an energy management system voice assistant. Analyze this voice command and determine the intended energy mode.

Voice Command: "{req.command}"
Language: {req.language}
Current Mode: {req.currentMode}
Available Modes: {', '.join(req.availableModes)}

Energy Mode Mappings:
- "solar" or "solar only" → solar
- "wind" or "wind only" → wind
- "solar and wind" or "renewable" or "hybrid" → solar+wind
- "all sources" or "everything" or "full power" → solar+wind+grid
- "grid" or "grid only" → grid

Respond with JSON only:
{{
  "mode": "detected_mode_or_null",
  "confidence": 0.0-1.0,
  "explanation": "brief_explanation"
}}
'''

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        text = getattr(response, "text", None)
        if not text:
            return GeminiResponse(mode=None, confidence=0.0, explanation="No valid response from Gemini")

        # Try to parse strict JSON
        import json, re
        parsed = None
        try:
            parsed = json.loads(text)
        except json.JSONDecodeError:
            # extract JSON object if wrapped or extra text present
            match = re.search(r"\{[\s\S]*\}", text)
            if match:
                try:
                    parsed = json.loads(match.group(0))
                except Exception:
                    parsed = None

        if parsed and isinstance(parsed, dict):
            return GeminiResponse(
                mode=parsed.get("mode"),
                confidence=float(parsed.get("confidence", 0.0)),
                explanation=parsed.get("explanation", "") or "Parsed from Gemini response",
            )

        return GeminiResponse(mode=None, confidence=0.0, explanation="Unable to parse Gemini response")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Gemini API error: {e}")


class ChatMessage(BaseModel):
    role: str  # 'user' | 'assistant' | 'system'
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    system: str | None = None
    temperature: float | None = None


class ChatResponse(BaseModel):
    text: str


@app.post("/api/gemini/chat", response_model=ChatResponse)
def gemini_chat(req: ChatRequest):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not set")
    if genai is None:
        raise HTTPException(status_code=500, detail="google-genai not available")

    client = genai.Client(api_key=api_key)

    # Build a simple conversation prompt
    system_context = req.system or (
        "You are an expert AI Mining Assistant helping with crushing optimization, grinding efficiency, predictive maintenance, Digital Twin simulation, equipment monitoring, and AI-driven process control."
    )
    conv = [f"{m.role.upper()}: {m.content}" for m in req.messages[-20:]]
    prompt = f"""
{system_context}

Provide concise, clear, and actionable answers.

Conversation so far:
{chr(10).join(conv)}

ASSISTANT:
"""
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        text = getattr(response, "text", "").strip()
        if not text:
            raise HTTPException(status_code=502, detail="Empty response from Gemini")
        return ChatResponse(text=text)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Gemini API error: {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True)
