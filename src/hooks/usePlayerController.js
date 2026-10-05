import { useState } from 'react';

export default function usePlayerController(totalSteps = 0) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  return {
    currentStep,
    isPlaying,
    speed,
    canGoPrevious: currentStep > 0,
    canGoNext: currentStep < totalSteps - 1,
    play: () => setIsPlaying(true),
    pause: () => setIsPlaying(false),
    next: () => setCurrentStep((step) => Math.min(step + 1, Math.max(totalSteps - 1, 0))),
    previous: () => setCurrentStep((step) => Math.max(step - 1, 0)),
    setSpeed,
  };
}