export default function Controls({
  isPlaying = false,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  speed = 1,
  onSpeedChange,
  canGoPrevious = true,
  canGoNext = true,
}) {
  return (
    <div className="controls" aria-label="Controles de reproducción">
      <button type="button" onClick={onPrevious} disabled={!canGoPrevious}>
        Paso anterior
      </button>
      <button
        type="button"
        onClick={isPlaying ? onPause : onPlay}
        aria-pressed={isPlaying}
      >
        {isPlaying ? 'Pausar' : 'Reproducir'}
      </button>
      <button type="button" onClick={onNext} disabled={!canGoNext}>
        Paso siguiente
      </button>
      <label>
        Velocidad
        <input
          type="range"
          min="0.25"
          max="2"
          step="0.25"
          value={speed}
          onChange={(event) => onSpeedChange?.(Number(event.target.value))}
        />
        <span>{speed}x</span>
      </label>
    </div>
  );
}