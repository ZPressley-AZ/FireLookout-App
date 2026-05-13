import { useState } from 'react';
import lookouts from '../data/lookouts.json';
import { DEFAULT_DECLINATION_DEG } from '../lib/geo';

export default function ShotInput({ onAddShot }) {
  const [lookoutId, setLookoutId] = useState(lookouts[0].id);
  const [bearing, setBearing] = useState('');
  const [range, setRange] = useState('');
  const [useMagnetic, setUseMagnetic] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const lookout = lookouts.find((l) => l.id === Number(lookoutId));
    if (!lookout) return;

    const bearingNum = parseFloat(bearing);
    const rangeNum = parseFloat(range);
    if (Number.isNaN(bearingNum) || Number.isNaN(rangeNum)) return;
    if (rangeNum <= 0) return;

    onAddShot({
      lookout,
      bearing: bearingNum,
      range: rangeNum,
      useMagnetic,
      declination: DEFAULT_DECLINATION_DEG,
    });

    // Clear bearing & range, but keep the lookout selected for fast follow-ups
    setBearing('');
    setRange('');
  };

  return (
    <form className="shot-input" onSubmit={handleSubmit}>
      <h3>Add a smoke</h3>

      <label>
        Lookout
        <select value={lookoutId} onChange={(e) => setLookoutId(e.target.value)}>
          {lookouts.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Azimuth (deg)
        <input
          type="number"
          inputMode="decimal"
          value={bearing}
          onChange={(e) => setBearing(e.target.value)}
          min="0"
          max="360"
          step="0.1"
          placeholder="0–360"
          required
        />
      </label>

      <label>
        Range (mi)
        <input
          type="number"
          inputMode="decimal"
          value={range}
          onChange={(e) => setRange(e.target.value)}
          min="0.1"
          step="0.1"
          placeholder="miles"
          required
        />
      </label>

      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={useMagnetic}
          onChange={(e) => setUseMagnetic(e.target.checked)}
        />
        Magnetic bearing (auto-correct {DEFAULT_DECLINATION_DEG}° E)
      </label>

      <button type="submit">Plot smoke</button>
    </form>
  );
}