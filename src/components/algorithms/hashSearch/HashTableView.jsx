export default function HashTableView({ buckets = [], currentBucket = -1, currentEntry = -1, status }) {
  return <div className="hash-table" aria-label="Tabla hash con encadenamiento">
    {buckets.map((bucket, index) => <div className={`hash-table__bucket ${index === currentBucket ? 'is-active' : ''}`} key={index}>
      <strong>Cubeta {index}</strong>
      <div className="hash-table__chain">{bucket.length ? bucket.map((value, entry) =>
        <span key={entry} className={`hash-table__entry ${index === currentBucket && entry === currentEntry ? (status === 'found' ? 'is-found' : 'is-current') : ''}`}>
          {entry > 0 && <span aria-hidden="true">→ </span>}{value}
        </span>) : <span>Vacía</span>}</div>
    </div>)}
  </div>;
}
