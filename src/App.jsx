import { useState } from 'react';
import lookouts from './data/lookouts.json';
import Map from './components/Map';
import ShotInput from './components/ShotInput';
import ShotList from './components/ShotList';
import './App.css';

// Defaults for initial selection state
const forests = [...new Set(lookouts.map((l) => l.forest))].sort();
const firstForest = forests[0];
const firstLookoutId = lookouts
  .filter((l) => l.forest === firstForest)
  .sort((a, b) => a.name.localeCompare(b.name))[0].id;

export default function App() {
  const [shots, setShots] = useState([]);
  const [selectedForest, setSelectedForest] = useState(firstForest);
  const [selectedLookoutId, setSelectedLookoutId] = useState(firstLookoutId);

  const addShot = (shot) => setShots((prev) => [...prev, shot]);
  const removeShot = (index) =>
    setShots((prev) => prev.filter((_, i) => i !== index));
  const clearAll = () => setShots([]);

  const handleTowerClick = (lookout) => {
    setSelectedForest(lookout.forest);
    setSelectedLookoutId(lookout.id);
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <header className="brand">
          <h1>Fire Lookout</h1>
        </header>

        <ShotInput
          onAddShot={addShot}
          selectedForest={selectedForest}
          setSelectedForest={setSelectedForest}
          selectedLookoutId={selectedLookoutId}
          setSelectedLookoutId={setSelectedLookoutId}
        />
        <ShotList shots={shots} onRemoveShot={removeShot} onClearAll={clearAll} />

        <footer className="hint">
          Right-click the map to copy coordinates.
        </footer>
      </aside>

      <main className="map-area">
        <Map shots={shots} onTowerClick={handleTowerClick} />
      </main>
    </div>
  );
}