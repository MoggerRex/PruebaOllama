export default function ArrayBar({ value, state = 'default', label }) {
  const height = `${Math.max(Number(value) || 0, 1)}%`;

  return (
    <div
      className={`array-bar array-bar--${state}`}
      role="img"
      aria-label={label ?? `Valor ${value}`}
      style={{ height }}
    >
      <span>{value}</span>
    </div>
  );
}