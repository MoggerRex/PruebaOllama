import { useEffect } from 'react';
import QuickSortTree from './QuickSortTree.jsx';
import useQuickSortLogic from './useQuickSortLogic.js';

export default function QuickSortVisualizer({
  inputNumbers,
  selectedCharacter,
  isPlaying,
  setStepExplanation
}) {
  // Extraemos las funciones y estados de la lógica
  const {
    steps,
    currentStep,
    currentStepIndex,
    algorithmOverview,
    loadQuickSortSteps,
    nextStep
  } = useQuickSortLogic();

  // 1. Efecto: Cargar la simulación cuando cambien los números de entrada o el personaje
  useEffect(() => {
    loadQuickSortSteps(inputNumbers, selectedCharacter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputNumbers, selectedCharacter]);

  // 2. Efecto: Enviar la explicación actual al panel inferior del Dashboard
  useEffect(() => {
    if (currentStep) {
      setStepExplanation(currentStep.explanation);
    } else {
      setStepExplanation('Preparando arreglo y cargando explicación de Llama...');
    }
  }, [currentStep, setStepExplanation]);

  // 3. Efecto: Reproducción automática (Play/Pausa) controlada desde el Dashboard
  useEffect(() => {
    let interval;
    // Si isPlaying es true y aún no llegamos al final de los pasos
    if (isPlaying && currentStepIndex < steps.length - 1) {
      interval = setInterval(() => {
        nextStep();
      }, 1200); // Cambia de paso cada 1.2 segundos (ajusta a tu gusto)
    }

    // Limpiamos el intervalo al desmontar o pausar
    return () => clearInterval(interval);
  }, [isPlaying, currentStepIndex, steps.length, nextStep]);

  return (
    <div className="w-full h-full flex flex-col justify-center p-4">
      {/* Pasamos los datos al componente encargado de pintar las barras */}
      <QuickSortTree
        currentStep={currentStep}
        algorithmOverview={algorithmOverview}
      />
    </div>
  );
}