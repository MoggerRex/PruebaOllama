import { useState } from 'react';
import HashTableView from './HashTableView.jsx';
import useHashSearchLogic from './useHashSearchLogic.js';

export default function HashSearchVisualizer() {
  const [numbers, setNumbers] = useState('8, 3, 1, 7, 0, 10, 2');
  const [target, setTarget] = useState('10');
  const [size, setSize] = useState('5');
  const [error, setError] = useState('');
  const { steps, currentStep, currentStepIndex, start, next, previous, reset } = useHashSearchLogic();
  const handleStart = (event) => {
    event.preventDefault();
    const tokens = numbers.split(',').map((value) => value.trim());
    const values = tokens.map(Number);
    if (tokens.some((value) => !value) || values.some((value) => !Number.isSafeInteger(value)) || values.length > 30 || !target.trim() || !Number.isSafeInteger(Number(target)) || !Number.isInteger(Number(size)) || Number(size) < 2 || Number(size) > 20) {
      setError('Ingresa de 1 a 30 enteros separados por comas, un entero a buscar y entre 2 y 20 cubetas.');
      return;
    }
    setError('');
    start(values, Number(target), Number(size));
  };
  return <section className="hash-search">
    <h2>Búsqueda hash paso a paso</h2>
    <p>Una función hash asigna cada número a una cubeta. Las colisiones se resuelven guardando varios valores en una cadena.</p>
    <form className="hash-search__form" onSubmit={handleStart}>
      <label>Números separados por comas<input value={numbers} onChange={(event) => setNumbers(event.target.value)} /></label>
      <div className="hash-search__fields">
        <label>Valor a buscar<input type="number" step="1" value={target} onChange={(event) => setTarget(event.target.value)} /></label>
        <label>Cantidad de cubetas<input type="number" min="2" max="20" step="1" value={size} onChange={(event) => setSize(event.target.value)} /></label>
      </div>
      <button type="submit">Iniciar búsqueda</button>
      {error && <p role="alert">{error}</p>}
    </form>
    {currentStep ? <>
      <p>Paso {currentStepIndex + 1} de {steps.length} · Azul: cubeta activa · Amarillo: valor actual · Verde: encontrado</p>
      <HashTableView {...currentStep} />
      <section className="hash-search__explanation" aria-live="polite">
        <h3>Explicación del paso</h3><p>{currentStep.explanation}</p>
        {currentStep.status === 'found' && <strong>Resultado: encontrado</strong>}
        {currentStep.status === 'missing' && <strong>Resultado: no encontrado</strong>}
      </section>
      <div className="hash-search__controls">
        <button type="button" onClick={previous} disabled={currentStepIndex === 0}>Paso anterior</button>
        <button type="button" onClick={next} disabled={currentStepIndex === steps.length - 1}>Paso siguiente</button>
        <button type="button" onClick={reset}>Volver al inicio</button>
      </div>
    </> : <p>Presiona «Iniciar búsqueda» para construir la tabla y recorrer la búsqueda.</p>}
    <p>La búsqueda tarda O(1) en promedio con una buena distribución y O(n) en el peor caso, si todos los valores comparten cadena.</p>
  </section>;
}
