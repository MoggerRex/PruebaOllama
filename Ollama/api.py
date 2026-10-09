from typing import Literal

import edge_tts
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ollama import chat
from starlette.responses import Response

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

class PromptRequest(BaseModel):
    prompt: str


class SpeechRequest(BaseModel):
    text: str
    profile: Literal["normal", "energico"] = "normal"
    
@app.get("/")
def home():
    return {
        "message": "API de Python funcionando correctamente"
    } 
   
@app.post("/ask")
def ask_llama(request: PromptRequest):
    try:
        response = chat(
            model="llama3.2:3b",
            messages=[
                {
                    "role": "system", 
                    "content": (
                        "Eres un asistente experto en algoritmos y ciencias de la computación. "
                        "Responde siempre en español, conserva la precisión técnica y sigue el estilo y formato indicados en la solicitud del usuario."
                    )
                },  
                {
                    "role": "user", 
                    "content": request.prompt
                }
            ]
        )
        return {
            "answer": response.message.content
        }
    except Exception as error:
        print(f"Error de ollama: {error}")
        
        raise HTTPException(
            status_code=500, detail="Error al procesar la solicitud con Ollama.")


@app.post("/speech")
async def generate_speech(request: SpeechRequest):
    text = request.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="El texto para lectura no puede estar vacío.")
    if len(text) > 10000:
        raise HTTPException(status_code=413, detail="El texto para lectura excede el límite de 10000 caracteres.")

    speech_profiles = {
        "normal": {"voice": "es-MX-DaliaNeural", "rate": "+0%", "pitch": "+0Hz"},
        "energico": {"voice": "es-MX-DaliaNeural", "rate": "+18%", "pitch": "+12Hz"},
    }
    settings = speech_profiles[request.profile]

    try:
        communicator = edge_tts.Communicate(text, **settings)
        audio_chunks = [
            chunk["data"]
            async for chunk in communicator.stream()
            if chunk["type"] == "audio"
        ]
    except Exception as error:
        print(f"Error generando audio: {error}")
        raise HTTPException(status_code=502, detail="No se pudo generar el audio de voz.") from error

    if not audio_chunks:
        raise HTTPException(status_code=502, detail="El servicio de voz no devolvió audio.")

    return Response(content=b"".join(audio_chunks), media_type="audio/mpeg")


