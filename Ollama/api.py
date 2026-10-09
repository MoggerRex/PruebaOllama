
from pathlib import Path
from typing import Literal
import json
import re

from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from ollama import chat, ResponseError
from pydantic import BaseModel, ConfigDict
import edge_tts


# ============================================================
# CONFIGURACIÓN
# ============================================================

OLLAMA_MODEL = "llama3.2:3b"

CHARACTERS_PATH = (
    Path(__file__).resolve().parent.parent
    / "src"
    / "config"
    / "llamaCharacters.json"
)

AlgorithmType = Literal[
    "Hash Search",
    "Quick Sort",
    "Binary Search",
    "Insertion Sort",
    "Bubble Sort"
]

VOICE_PROFILES = {
    # Voz normal, tranquila
    "normal": {"voice": "es-MX-DaliaNeural", "rate": "+0%", "pitch": "+0Hz"},
    # Voz enérgica: masculina, más rápida y aguda
    "energico": {"voice": "es-MX-JorgeNeural", "rate": "+18%", "pitch": "+12Hz"},
}

# ============================================================
# DATOS TÉCNICOS DE LOS ALGORITMOS
# ============================================================

ALGORITHM_FACTS = {
    "Hash Search": {
        "concept": (
            "Busca un elemento utilizando una función hash "
            "para determinar dónde podría encontrarse."
        ),
        "steps": (
            "Calcula el hash de la clave, localiza la cubeta "
            "correspondiente y comprueba si contiene el elemento. "
            "Si existen colisiones, utiliza encadenamiento para "
            "recorrer los elementos de esa cubeta."
        ),
        "complexity": {
            "best": "O(1)",
            "average": "O(1) esperado con buena distribución y factor de carga acotado",
            "worst": "O(n)",
            "space": "O(n) para almacenar n elementos"
        },
        "uses": (
            "Búsquedas rápidas por clave, como diccionarios "
            "y tablas hash."
        ),
        "conditions": (
            "Se utiliza una tabla hash con encadenamiento. "
            "La construcción de la tabla requiere O(n) tiempo. "
            "El promedio O(1) depende de una función hash adecuada "
            "y un factor de carga controlado."
        )
    },

    "Quick Sort": {
        "concept": (
            "Ordena elementos mediante particiones alrededor "
            "de un pivote."
        ),
        "steps": (
            "Selecciona el último elemento como pivote. "
            "Reorganiza el arreglo colocando los menores o iguales "
            "a un lado y los mayores al otro. "
            "Aplica recursión a ambas particiones. "
            "Termina cuando una partición tiene cero o un elemento."
        ),
        "complexity": {
            "best": "O(n log n)",
            "average": "O(n log n)",
            "worst": "O(n²)",
            "space": "O(log n) promedio y O(n) peor caso"
        },
        "uses": "Ordenar arreglos en memoria.",
        "conditions": (
            "Se considera una implementación recursiva in-place "
            "con pivote final. La complejidad espacial corresponde "
            "a la pila de llamadas."
        )
    },

    "Binary Search": {
        "concept": (
            "Encuentra un elemento en un arreglo previamente ordenado."
        ),
        "steps": (
            "Compara el objetivo con el elemento central. "
            "Si son iguales, termina. "
            "Si el objetivo es menor, continúa en la mitad izquierda; "
            "si es mayor, continúa en la derecha. "
            "Repite hasta encontrarlo o agotar el intervalo."
        ),
        "complexity": {
            "best": "O(1)",
            "average": "O(log n)",
            "worst": "O(log n)",
            "space": "O(1)"
        },
        "uses": "Buscar rápidamente en arreglos ordenados.",
        "conditions": (
            "Se utiliza la versión iterativa. "
            "El arreglo debe estar ordenado."
        )
    },

    "Insertion Sort": {
        "concept": (
            "Ordena elementos insertando cada uno "
            "en su posición dentro de una sección ya ordenada."
        ),
        "steps": (
            "Comienza con el primer elemento como sección ordenada. "
            "Toma el siguiente elemento y desplaza hacia la derecha "
            "los valores mayores para insertarlo en su posición. "
            "Repite hasta ordenar todo el arreglo."
        ),
        "complexity": {
            "best": "O(n)",
            "average": "O(n²)",
            "worst": "O(n²)",
            "space": "O(1)"
        },
        "uses": (
            "Arreglos pequeños o casi ordenados."
        ),
        "conditions": (
            "Se considera la implementación iterativa in-place."
        )
    },

    "Bubble Sort": {
        "concept": (
            "Ordena elementos comparando e intercambiando "
            "pares adyacentes."
        ),
        "steps": (
            "Recorre el arreglo comparando elementos vecinos. "
            "Los intercambia si están desordenados. "
            "Repite los recorridos hasta que no haya intercambios."
        ),
        "complexity": {
            "best": "O(n)",
            "average": "O(n²)",
            "worst": "O(n²)",
            "space": "O(1)"
        },
        "uses": (
            "Enseñanza de algoritmos y arreglos pequeños; "
            "no suele ser la mejor opción para grandes conjuntos."
        ),
        "conditions": (
            "Se utiliza la versión optimizada que termina "
            "si un recorrido no realiza intercambios."
        )
    }
}


# ============================================================
# FASTAPI Y CORS
# ============================================================

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


# ============================================================
# MODELOS DE SOLICITUD Y RESPUESTA
# ============================================================

class AlgorithmOverviewRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    algorithm: AlgorithmType
    character: str


class AlgorithmOverviewResponse(BaseModel):
    algorithm: AlgorithmType
    character: str
    explanation: str


class SpeakRequest(BaseModel):
    text: str
    profile: str = "normal"


# ============================================================
# FUNCIONES AUXILIARES
# ============================================================

def get_character_profile(character: str) -> str:
    character_profiles = json.loads(CHARACTERS_PATH.read_text(encoding="utf-8"))
    char_info = character_profiles.get(character)

    if char_info is None:
        raise HTTPException(
            status_code=422,
            detail=f"No hay un perfil configurado para el personaje '{character}'."
        )

    if isinstance(char_info, dict):
        return json.dumps(
            char_info,
            ensure_ascii=False,
            indent=2
        )

    return str(char_info)

def clean_text_for_speech(text: str) -> str:
    """Quita Markdown para que la voz no lea símbolos."""
    text = re.sub(r"[*_#`>]+", "", text)
    text = re.sub(r"\s*\n\s*", ". ", text)
    text = re.sub(r"\.{2,}", ".", text)
    return text.strip()


# ============================================================
# ENDPOINT: EXPLICACIÓN DE ALGORITMOS CON PERSONAJES
# ============================================================

@app.post(
    "/algorithm",
    response_model=AlgorithmOverviewResponse
)
def get_algorithm(request: AlgorithmOverviewRequest):
    try:
        character_profile = get_character_profile(
            request.character
        )

        facts = ALGORITHM_FACTS[request.algorithm]

        system_prompt = f"""
Eres un tutor experto en Estructuras de Datos y Algoritmos que explica
    el tema con la voz del personaje {request.character}.

PERFIL AUTORITATIVO DEL PERSONAJE (tomado de llamaCharacters.json):
{character_profile}

PERSONALIZACIÓN:
- Usa personality, tone, speaking_style e intensity para definir
    la voz de toda la explicación; no te limites a insertar catchphrases.
- Usa analogy y analogy_guidance para elegir una comparación específica
    que aclare el funcionamiento del algoritmo y corresponda a este personaje.
- Sigue roleplay_rules literalmente. Estas reglas prevalecen sobre cualquier
    instrucción general de estilo de este prompt.
- Usa catchphrases únicamente si encajan con el perfil y respeta el límite
    definido en roleplay_rules. No inventes frases características.
- No impongas saludos, despedidas, humor, entusiasmo ni analogías cuando
    el perfil o sus reglas no los pidan.
- Evita agregar detalles del universo del personaje que no hagan falta
    para explicar el algoritmo.

PRECISIÓN TÉCNICA:
- Los datos técnicos verificados del mensaje del usuario son la única
    fuente para describir el algoritmo.
- No inventes pasos, resultados, complejidades, condiciones ni ejemplos.
- Conserva los términos técnicos y distingue mejor caso, promedio y peor caso.
- Incluye las condiciones de implementación cuando sean relevantes.
- Si una analogía entra en conflicto con los datos técnicos, conserva los
    datos técnicos y adapta o elimina la analogía.

FORMATO:
- Responde en español, con un máximo aproximado de 130 palabras.
- Usa exactamente estos tres apartados y en este orden:

**¿Qué hace?**
**¿Cómo funciona?**
**Complejidad y uso**

- Resume el objetivo en el primero; explica el mecanismo con la voz del
    personaje en el segundo; conserva complejidades, condiciones y una
    aplicación práctica en el tercero.
- No escribas código ni agregues introducciones. Evita repetir información
    y termina con una oración completa.
"""

        user_prompt = f"""
Explica el algoritmo: {request.algorithm}

DATOS TÉCNICOS VERIFICADOS:
{json.dumps(facts, ensure_ascii=False, indent=2)}

Transforma estos datos en una explicación educativa altamente personalizada.
Haz reconocible la personalidad del perfil en la elección de palabras,
el ritmo y la analogía, sin alterar ningún dato técnico.

Recuerda: la exactitud técnica es obligatoria
y la respuesta debe ser breve.
"""

        response = chat(
            model=OLLAMA_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": user_prompt
                }
            ],
            options={
                "temperature": 0.4,
                "num_predict": 350
            }
        )

        explanation = response.message.content

        if not explanation or not explanation.strip():
            raise ValueError("Ollama devolvió una respuesta vacía.")

        return {
            "algorithm": request.algorithm,
            "character": request.character,
            "explanation": explanation.strip()
        }

    except HTTPException:
        raise

    except ConnectionError as error:
        raise HTTPException(
            status_code=503,
            detail=(
                "No se pudo conectar con Ollama. "
                "Verifica que esté iniciado."
            )
        ) from error

    except ResponseError as error:
        detail = (
            f"El modelo {OLLAMA_MODEL} no está disponible. "
            f"Instálalo con ollama pull {OLLAMA_MODEL}."
            if error.status_code == 404
            else "Ollama no pudo generar la explicación."
        )

        raise HTTPException(
            status_code=502,
            detail=detail
        ) from error

    except Exception as error:
        print(f"Error en Ollama: {error}")

        raise HTTPException(
            status_code=500,
            detail="Error al generar la explicación con Ollama."
        ) from error


# ============================================================
# ENDPOINT: HOME
# ============================================================

@app.get("/")
def home():
    return {
        "message": "API de Python funcionando correctamente"
    }


# ============================================================
# ENDPOINT: TEXTO A VOZ
# ============================================================

@app.post("/speech")
async def speak(request: SpeakRequest):
    text = clean_text_for_speech(request.text)
    if not text:
        raise HTTPException(status_code=400, detail="El texto está vacío.")

    profile = VOICE_PROFILES.get(request.profile, VOICE_PROFILES["normal"])

    try:
        communicate = edge_tts.Communicate(
            text[:2000],
            profile["voice"],
            rate=profile["rate"],
            pitch=profile["pitch"],
        )
        audio = bytearray()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio.extend(chunk["data"])

        return Response(content=bytes(audio), media_type="audio/mpeg")

    except Exception as error:
        print(f"Error de TTS: {error}")
        raise HTTPException(
            status_code=500,
            detail="No se pudo generar el audio."
        ) from error