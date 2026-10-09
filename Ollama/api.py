from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ollama import chat

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


