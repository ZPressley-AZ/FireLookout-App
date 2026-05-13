function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ShotList({ shots, onRemoveShot, onClearAll }) {
  if (shots.length === 0) {
    return (
      <div className="shot-list empty">
        <p>No active smokes. Add one above.</p>
      </div>
    );
  }

  return (
    <div className="shot-list">
      <div className="shot-list-header">
        <h3>Active smokes ({shots.length})</h3>
        <button type="button" className="link-button" onClick={onClearAll}>
          Clear all
        </button>
      </div>
      <ul>
        {shots.map((shot, i) => (
          <li key={i}>
            <div className="shot-summary">
              <strong>{shot.lookout.name}</strong>
              <span className="shot-details">
                {shot.bearing}° {shot.useMagnetic ? 'mag' : 'true'} &middot; {shot.range} mi
                {shot.time && <> &middot; {formatTime(shot.time)}</>}
              </span>
            </div>
            <button
              type="button"
              className="remove-button"
              onClick={() => onRemoveShot(i)}
              aria-label={`Remove smoke from ${shot.lookout.name}`}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}