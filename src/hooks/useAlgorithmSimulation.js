import { useState } from 'react';

const snapshot = (array, details = {}) => ({
  array: [...array],
  ...details,
  itemIds: [...(details.itemIds ?? array.map((_, index) => index))],
});

function createQuickSortSteps(values) {
  const array = [...values];
  const itemIds = array.map((_, index) => index);
  const steps = [];
  const sortedIndices = new Set();
  const state = (details = {}) => ({ itemIds, sortedIndices: [...sortedIndices], ...details });

  function partition(low, high) {
    const pivot = array[high];
    let boundary = low - 1;
    steps.push(snapshot(array, state({ pivotIndex: high, explanation: `Elegimos ${pivot} como pivote y revisamos el tramo de índices ${low} a ${high}.` })));

    for (let index = low; index < high; index += 1) {
      steps.push(snapshot(array, state({
        pivotIndex: high,
        comparingIndices: [index],
        explanation: `${array[index]} ${array[index] < pivot ? 'es menor' : 'no es menor'} que el pivote ${pivot}.`,
      })));
      if (array[index] < pivot) {
        boundary += 1;
        if (boundary !== index) {
          [array[boundary], array[index]] = [array[index], array[boundary]];
          [itemIds[boundary], itemIds[index]] = [itemIds[index], itemIds[boundary]];
          steps.push(snapshot(array, state({ pivotIndex: high, swappedIndices: [boundary, index], explanation: `Intercambiamos ambos valores para dejar ${array[boundary]} en el grupo menor al pivote.` })));
        }
      }
    }

    if (boundary + 1 !== high) {
      [array[boundary + 1], array[high]] = [array[high], array[boundary + 1]];
      [itemIds[boundary + 1], itemIds[high]] = [itemIds[high], itemIds[boundary + 1]];
    }
    sortedIndices.add(boundary + 1);
    steps.push(snapshot(array, state({ pivotIndex: boundary + 1, swappedIndices: [boundary + 1, high], explanation: `El pivote queda en su posición definitiva: índice ${boundary + 1}.` })));
    return boundary + 1;
  }

  function sort(low, high) {
    if (low > high) return;
    if (low === high) {
      sortedIndices.add(low);
      steps.push(snapshot(array, state({ explanation: `El valor ${array[low]} ocupa la única posición de su tramo y queda en orden.` })));
      return;
    }
    const pivot = partition(low, high);
    sort(low, pivot - 1);
    sort(pivot + 1, high);
  }

  sort(0, array.length - 1);
  steps.push(snapshot(array, state({ explanation: 'Quicksort terminó: los elementos quedaron ordenados.' })));
  return steps;
}

function createInsertionSortSteps(values) {
  const array = [...values];
  const itemIds = array.map((_, index) => index);
  const steps = [snapshot(array, { itemIds, sortedThrough: 0, explanation: 'La primera posición forma una sección ordenada de un elemento.' })];

  for (let index = 1; index < array.length; index += 1) {
    const current = array[index];
    const currentId = itemIds[index];
    let cursor = index - 1;
    steps.push(snapshot(array, { itemIds, sortedThrough: index - 1, comparingIndices: [index], activeIndices: [index], explanation: `Tomamos ${current} y buscamos dónde insertarlo en la parte ordenada.` }));
    while (cursor >= 0 && array[cursor] > current) {
      const displacedValue = array[cursor];
      const displacedId = itemIds[cursor];
      array[cursor] = current;
      array[cursor + 1] = displacedValue;
      itemIds[cursor] = currentId;
      itemIds[cursor + 1] = displacedId;
      steps.push(snapshot(array, { itemIds, sortedThrough: index - 1, comparingIndices: [cursor, cursor + 1], swappedIndices: [cursor, cursor + 1], activeIndices: [cursor + 1], explanation: `${displacedValue} es mayor que ${current}; intercambiamos ambos valores para acercar ${current} a su posición.` }));
      cursor -= 1;
    }
    steps.push(snapshot(array, { itemIds, sortedThrough: index, activeIndices: [cursor + 1], swappedIndices: [cursor + 1], explanation: `Insertamos ${current} en el índice ${cursor + 1}. La sección ordenada crece.` }));
  }

  steps.push(snapshot(array, { itemIds, sortedThrough: array.length - 1, explanation: 'Inserción terminó: el arreglo está ordenado.' }));
  return steps;
}

export function createBinarySearchSteps(values, target) {
  const numericTarget = target === '' || target === null || target === undefined ? Number.NaN : Number(target);
  const array = [...values].sort((left, right) => left - right);
  const steps = [];
  let low = 0;
  let high = array.length - 1;
  if (!Number.isFinite(numericTarget)) {
    steps.push(snapshot(array, { low, high, status: 'invalid', explanation: 'Ingresa un objetivo numérico válido para iniciar la búsqueda.' }));
    return steps;
  }
  steps.push(snapshot(array, { low, high, explanation: 'Ordenamos los datos primero, porque la búsqueda binaria necesita una secuencia ordenada.' }));

  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const value = array[middle];
    steps.push(snapshot(array, { low, high, middle, comparingIndices: [middle], explanation: `Comparamos ${numericTarget} con el valor central ${value} (índice ${middle}).` }));
    if (value === numericTarget) {
      steps.push(snapshot(array, { low, high, middle, activeIndices: [middle], status: 'found', explanation: `Encontramos ${numericTarget} en el índice ${middle}.` }));
      return steps;
    }
    if (value < numericTarget) {
      low = middle + 1;
      steps.push(snapshot(array, { low, high, middle, explanation: `${value} es menor que ${numericTarget}; descartamos la mitad izquierda.` }));
    } else {
      high = middle - 1;
      steps.push(snapshot(array, { low, high, middle, explanation: `${value} es mayor que ${numericTarget}; descartamos la mitad derecha.` }));
    }
  }

  steps.push(snapshot(array, { low, high, status: 'missing', explanation: `${numericTarget} no aparece. El intervalo quedó vacío, así que terminamos.` }));
  return steps;
}

export function createHashSearchSteps(values, target) {
  const numericTarget = target === '' || target === null || target === undefined ? Number.NaN : Number(target);
  const bucketCount = Math.max(3, Math.ceil(Math.sqrt(values.length)) + 1);
  const buckets = Array.from({ length: bucketCount }, () => []);
  const steps = [];
  const bucketFor = (value) => ((value % bucketCount) + bucketCount) % bucketCount;
  const addStep = (details) => steps.push({ array: [...values], buckets: buckets.map((bucket) => [...bucket]), ...details });

  if (!Number.isFinite(numericTarget)) {
    addStep({ status: 'invalid', explanation: 'Ingresa un objetivo numérico válido para iniciar la búsqueda.' });
    return steps;
  }

  addStep({ explanation: `Creamos ${bucketCount} cubetas vacías para construir la tabla hash.` });
  values.forEach((value) => {
    const bucketIndex = bucketFor(value);
    buckets[bucketIndex].push(value);
    addStep({ activeBucket: bucketIndex, currentValue: value, explanation: `La función hash asigna ${value} a la cubeta ${bucketIndex}.` });
  });

  const targetBucket = bucketFor(numericTarget);
  addStep({ activeBucket: targetBucket, currentValue: numericTarget, explanation: `Para buscar ${numericTarget}, calculamos su cubeta: ${numericTarget} módulo ${bucketCount} = ${targetBucket}.` });
  const chain = buckets[targetBucket];
  for (let index = 0; index < chain.length; index += 1) {
    const found = chain[index] === numericTarget;
    addStep({ activeBucket: targetBucket, activeChainIndex: index, currentValue: numericTarget, status: found ? 'found' : undefined, explanation: found ? `La cadena de la cubeta ${targetBucket} contiene ${numericTarget}.` : `Revisamos ${chain[index]}; no coincide, seguimos por la cadena de colisiones.` });
    if (found) return steps;
  }

  addStep({ activeBucket: targetBucket, currentValue: numericTarget, status: 'missing', explanation: `La cubeta ${targetBucket} no contiene ${numericTarget}; el valor no está en la tabla.` });
  return steps;
}

function createSteps(algorithm, values, target) {
  if (algorithm === 'insertionsort') return createInsertionSortSteps(values);
  if (algorithm === 'binarysearch') return createBinarySearchSteps(values, target);
  if (algorithm === 'hashsearch') return createHashSearchSteps(values, target);
  return createQuickSortSteps(values);
}

export default function useAlgorithmSimulation(algorithm, values, target) {
  const steps = createSteps(algorithm, values, target);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  return {
    steps,
    currentStepIndex,
    currentStep: steps[currentStepIndex] ?? null,
    setCurrentStepIndex,
  };
}