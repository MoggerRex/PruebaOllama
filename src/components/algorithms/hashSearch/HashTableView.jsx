export default function HashTableView({ buckets = [], currentBucket = -1 }) {
  return (
    <div className="hash-table" aria-label="Tabla hash">
      {buckets.length === 0 ? (
        <p>Visualización de tabla hash</p>
      ) : (
        buckets.map((bucket, index) => (
          <div
            className={index === currentBucket ? 'hash-table__bucket is-active' : 'hash-table__bucket'}
            key={index}
          >
            <span>{index}</span>
            <span>{bucket ?? 'Vacío'}</span>
          </div>
        ))
      )}
    </div>
  );
}