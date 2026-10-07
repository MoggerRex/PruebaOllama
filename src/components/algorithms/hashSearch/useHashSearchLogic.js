import { useState } from 'react';

export function buildHashSearchSteps(values, target, size) {
  const buckets = Array.from({ length: size }, () => []);
  const steps = [];
  const hash = (value) => ((value % size) + size) % size;
  const record = (explanation, currentBucket = -1, currentEntry = -1, status = 'pending') => steps.push({ buckets: buckets.map((bucket) => [...bucket]), explanation, currentBucket, currentEntry, status });
  record(`Creamos ${size} cubetas vacías. La función h(x) = ((x % ${size}) + ${size}) % ${size} también admite negativos.`);
  values.forEach((value) => {
    const index = hash(value);
    const collision = buckets[index].length > 0;
    buckets[index].push(value);
    record(`Insertamos ${value}: h(${value}) = ${index}. ${collision ? 'Hay colisión: añadimos el valor al final de la cadena.' : 'Guardamos el valor en la cubeta vacía.'}`, index, buckets[index].length - 1);
  });
  const index = hash(target);
  record(`Buscamos ${target}: h(${target}) = ${index}. Revisamos solamente la cadena de la cubeta ${index}.`, index);
  for (let entry = 0; entry < buckets[index].length; entry += 1) {
    const found = buckets[index][entry] === target;
    record(`Comparamos ${target} con ${buckets[index][entry]}. ${found ? 'Son iguales: valor encontrado.' : 'Son distintos: avanzamos en la cadena.'}`, index, entry, found ? 'found' : 'pending');
    if (found) return steps;
  }
  record(`El valor ${target} no está en la tabla: ${buckets[index].length ? 'terminamos la cadena sin encontrarlo.' : 'la cubeta está vacía.'}`, index, -1, 'missing');
  return steps;
}

export default function useHashSearchLogic() {
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  return {
    steps, currentStepIndex, currentStep: steps[currentStepIndex],
    start: (values, target, size) => { setSteps(buildHashSearchSteps(values, target, size)); setCurrentStepIndex(0); },
    next: () => setCurrentStepIndex((index) => Math.min(index + 1, steps.length - 1)),
    previous: () => setCurrentStepIndex((index) => Math.max(index - 1, 0)),
    reset: () => setCurrentStepIndex(0),
  };
}
