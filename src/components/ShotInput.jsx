import { useState } from 'react';
import lookouts from '../data/lookouts.json';
import { DEFAULT_DECLINATION_DEG } from '../lib/geo';

function nowLocalIso() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

const forests = [...new Set(lookouts.map((l) => l.forest))].sort();
const lookoutsByForest = forests.reduce((acc, f) => {
  acc[f] = lookouts
    .filter((l) => l.forest === f)
    .sort((a, b) => a.name.localeCompare(b.name));
  return acc;
}, {});

export default function ShotInput({
  onAddShot,
  selectedForest,
  setSelectedForest,
  selectedLookoutId,
  setSelectedLookoutId,
}) {
  const [bearing, setBearing] = useState('');
  const [range, setRange] = useState('');
  const [useMagnetic, setUseMagnetic] = useState(false);
  const [time, setTime] = useState(nowLocalIso());
  const [timeEdited, setTimeEdited] = useState(false);

  const handleForestChange = (newForest) => {
    setSelectedForest(newForest);
    setSelectedLookoutId(lookoutsByForest[newForest][0].id);
  };

  const handleTimeChange = (e) => {
    setTime(e.target.value);
    setTimeEdited(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const lookout = lookouts.find((l) => l.id === Number(selectedLookoutId));
    if (!lookout) return;

    const bearingNum = parseFloat(bearing);
    const rangeNum = parseFloat(range);
    if (Number.isNaN(bearingNum) || Number.isNaN(rangeNum)) return;
    if (rangeNum <= 0) return;

    // If the user hasn't manually changed the time field, use the actual
    // current moment rather than whatever was prefilled when the page loaded.
    const effectiveTime = timeEdited && time ? time : nowLocalIso();

    onAddShot({
      lookout,
      bearing: bearingNum,
      range: rangeNum,
      useMagnetic,
      declination: DEFAULT_DECLINATION_DEG,
      time: effectiveTime,
    });

    setBearing('');
    setRange('');
    setTime(nowLocalIso());
    setTimeEdited(false);
  };

  return (
    <form className="shot-input" onSubmit={handleSubmit}>
      <h3>Add a smoke</h3>

      <label>
        Forest
        <select value={selectedForest} onChange={(e) => handleForestChange(e.target.value)}>
          {forests.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </label>

      <label>
        Lookout
        <select
          value={selectedLookoutId}
          onChange={(e) => setSelectedLookoutId(Number(e.target.value))}
        >
          {lookoutsByForest[selectedForest].map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
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
          onChange={handleTimeChange}
        />
      </label>

      <button type="submit">Plot smoke</button>
    </form>
  );
}