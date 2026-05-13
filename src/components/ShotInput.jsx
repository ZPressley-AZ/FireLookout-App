import { useState } from 'react';
import lookouts from '../data/lookouts.json';
import { DEFAULT_DECLINATION_DEG } from '../lib/geo';

function nowLocalIso() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

// Build the sorted list of forests and group lookouts by forest
const forests = [...new Set(lookouts.map((l) => l.forest))].sort();
const lookoutsByForest = forests.reduce((acc, f) => {
  acc[f] = lookouts
    .filter((l) => l.forest === f)
    .sort((a, b) => a.name.localeCompare(b.name));
  return acc;
}, {});

export default function ShotInput({ onAddShot }) {
  const [selectedForest, setSelectedForest] = useState(forests[0]);
  const [lookoutId, setLookoutId] = useState(lookoutsByForest[forests[0]][0].id);
  const [bearing, setBearing] = useState('');
  const [range, setRange] = useState('');
  const [useMagnetic, setUseMagnetic] = useState(false);
  const [time, setTime] = useState(nowLocalIso());

  const handleForestChange = (newForest) => {
    setSelectedForest(newForest);
    setLookoutId(lookoutsByForest[newForest][0].id);
  };

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
      time,
    });

    setBearing('');
    setRange('');
    setTime(nowLocalIso());
  };

  return (
    <form className="shot-input" onSubmit={handleSubmit}>
      <h3>Add a smoke</h3>

      <label>
        Region
        <select value={selectedForest} onChange={(e) => handleForestChange(e.target.value)}>
          {forests.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </label>

      <label>
        Lookout
        <select value={lookoutId} onChange={(e) => setLookoutId(e.target.value)}>
          {lookoutsByForest[selectedForest].map((l) => (
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

      <label>
        Time reported
        <input
          type="datetime-local"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
      </label>

      <button type="submit">Plot smoke</button>
    </form>
  );
}