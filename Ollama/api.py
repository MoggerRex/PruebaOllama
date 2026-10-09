
from enum import Enum
from pathlib import Path
from typing import Literal
import json
import logging
import tempfile
from threading import Lock
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
MODELS_DIR = Path(__file__).resolve().parent.parent / "models"
GOKU_MODEL_PATH = MODELS_DIR / "Goku.pth"
GOKU_INDEX_PATH = MODELS_DIR / "Goku.index"
GOKU_F0_UP_KEY = 0
NEUTRAL_VOICE = "es-MX-JorgeNeural"
logger = logging.getLogger(__name__)
_rvc_lock = Lock()
_goku_rvc = None

CHARACTERS_PATH = (
    Path(__file__).resolve().parent.parent
    / "src"
    / "config"
    / "llamaCharacters.json"
)

CHARACTER_PROMPTS = json.loads(
    CHARACTERS_PATH.read_text(encoding="utf-8")
)

CharacterType = Enum(
    "CharacterType",
    {name: name for name in CHARACTER_PROMPTS},
    type=str
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
    character: CharacterType


class AlgorithmOverviewResponse(BaseModel):
    algorithm: AlgorithmType
    character: CharacterType
    explanation: str


class SpeakRequest(BaseModel):
    text: str
    profile: str = "normal"


class SpeakRequest(BaseModel):
    text: str
    character: str = ""


# ============================================================
# FUNCIONES AUXILIARES
# ============================================================

def convert_goku_audio(input_path: Path, output_path: Path) -> bytes:
    global _goku_rvc

    # Serialize inference because the cached RVC instance has mutable state.
    with _rvc_lock:
        if _goku_rvc is None:
            import torch
            from rvc_python.infer import RVCInference

            converter = RVCInference(
                models_dir=str(MODELS_DIR),
                device="cuda:0" if torch.cuda.is_available() else "cpu",
            )
            converter.load_model(
                str(GOKU_MODEL_PATH), index_path=str(GOKU_INDEX_PATH)
            )
            converter.set_params(
                f0up_key=GOKU_F0_UP_KEY,
                f0method="rmvpe",
                index_rate=0.75,
                protect=0.33,
            )
            _goku_rvc = converter

        _goku_rvc.infer_file(str(input_path), str(output_path))
        audio = output_path.read_bytes()
        if not audio:
            raise ValueError("RVC returned empty audio.")
        return audio


async def generate_speech(text: str, character: str) -> tuple[bytes, str]:
    import edge_tts

    temporary_paths = []
    try:
        # Close handles before external libraries open the files on Windows.
        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as base:
            base_path = Path(base.name)
            temporary_paths.append(base_path)

        await edge_tts.Communicate(text, NEUTRAL_VOICE).save(str(base_path))
        neutral_audio = base_path.read_bytes()
        if not neutral_audio:
            raise ValueError("edge-tts returned empty audio.")

        if (
            character == "Goku"
            and GOKU_MODEL_PATH.is_file()
            and GOKU_INDEX_PATH.is_file()
        ):
            try:
                with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as converted:
                    converted_path = Path(converted.name)
                    temporary_paths.append(converted_path)
                audio = await run_in_threadpool(
                    convert_goku_audio, base_path, converted_path
                )
                return audio, "audio/wav"
            except Exception:
                logger.exception("Goku conversion failed; returning neutral audio.")

        return neutral_audio, "audio/mpeg"
    finally:
        for path in temporary_paths:
            try:
                path.unlink(missing_ok=True)
            except OSError:
                logger.exception("Could not remove temporary audio: %s", path)


@app.post("/speak")
async def speak(request: SpeakRequest):
    text = request.text.strip()
    if not text:
        raise HTTPException(status_code=422, detail="El texto no puede estar vacio.")
    try:
        audio, media_type = await generate_speech(text, request.character)
    except Exception as error:
        logger.exception("Speech generation failed.")
        raise HTTPException(
            status_code=502, detail="No se pudo generar el audio con edge-tts."
        ) from error
    # Audio is already in memory when temporary files are removed.
    return Response(content=audio, media_type=media_type)


def get_character_profile(character: CharacterType) -> str:
    char_info = CHARACTER_PROMPTS[character.value]

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
Eres un tutor experto en Estructuras de Datos y Algoritmos
que interpreta al personaje {request.character.value}.

PERFIL DEL PERSONAJE:
{character_profile}

OBJETIVO:
Explicar algoritmos de forma breve, clara y entretenida.

REGLAS DE PERSONALIDAD:
- Interpreta al personaje durante toda la explicación.
- Mantén su personalidad, tono y forma de expresarse.
- No hables como un profesor genérico que solamente
  agrega frases características.
- Incluye obligatoriamente una analogía concreta
  relacionada con el universo del personaje.
- La analogía debe explicar cómo funciona el algoritmo,
  no ser únicamente una decoración.
- Integra la analogía principalmente en "¿Cómo funciona?".
- Usa una o dos expresiones de "catchphrases" cuando
  encajen naturalmente.
- Puedes mencionar elementos, lugares, habilidades
  o situaciones reconocibles del universo del personaje.
- No fuerces saludos ni despedidas.
- Mantén la precisión técnica por encima del roleplay.

REGLAS DE PRECISIÓN TÉCNICA:
- Utiliza exclusivamente los datos técnicos proporcionados.
- No inventes pasos, resultados, complejidades ni ejemplos.
- Conserva los términos técnicos correctos.
- No confundas mejor caso, promedio y peor caso.
- Si una complejidad depende de la implementación,
  menciona esa condición cuando sea importante.
- La precisión técnica siempre tiene prioridad
  sobre la interpretación del personaje.


FORMATO DE RESPUESTA:
- Responde siempre en español.
- Escribe entre 130 palabras aproximadamente como maximo.
- Usa exactamente estos tres apartados:

**¿Qué hace?**
**¿Cómo funciona?**
**Complejidad y uso**

- En "¿Qué hace?", explica brevemente el objetivo.
- En "¿Cómo funciona?", explica el algoritmo mediante
  una analogía del universo del personaje.
- En "Complejidad y uso", conserva los datos técnicos
  exactos y menciona una aplicación práctica.
- No agregues introducciones largas.
- No escribas código.
- Evita repetir información.
- Termina con una oración completa.

"""

        user_prompt = f"""
Explica el algoritmo: {request.algorithm}

DATOS TÉCNICOS VERIFICADOS:
{json.dumps(facts, ensure_ascii=False, indent=2)}

Transforma estos datos en una explicación educativa
siguiendo la personalidad del personaje.

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

@app.post("/speak")
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