export default function ExplanationPanel({ explanation, loading = false, error }) {
  return (
    <section className="explanation-panel" aria-live="polite">
      <h2>Explicación</h2>
      {loading && <p>Generando explicación...</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && <p>{explanation || 'La explicación aparecerá aquí.'}</p>}
    </section>
  );
}