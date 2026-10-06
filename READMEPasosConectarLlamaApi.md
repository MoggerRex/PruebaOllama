# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

##Pasos para correr el proyecto:

Paso 1 - Iniciar Ollama

Iniciar ollama: ollama run llama3.2:3b
Version de ollama: 
Cerrar chat de ollama: ctrl D o \bye

extenciones de python:
pylance



Paso 2 - Environment y Paquetes

---en powershell de visual studio code:

python -m venv .venv

.\.venv\Scripts\Activate.ps1

pip install -r requirements.txt


Paso 3 - Correr el proyecto


Primero corre tu proyecto: npm run dev (npm install antes si es la primera vez que instalas el proyecto)

Revisar que el entorno este activado: .\.venv\Scripts\activate

en otra terminal en el mismo proyecto, ir a la carpeta desde la terminal: cd ..\Ollama

Correr este comando: python -m uvicorn api:app --reload

Debes correr ese comando en la carpeta donde tengas el api.py