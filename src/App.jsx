import { useState } from 'react';
import Map from './components/Map';
import ShotInput from './components/ShotInput';
import ShotList from './components/ShotList';
import './App.css';

export default function App() {
  const [shots, setShots] = useState([]);

  const addShot = (shot) => setShots((prev) => [...prev, shot]);
  const removeShot = (index) =>
    setShots((prev) => prev.filter((_, i) => i !== index));
  const clearAll = () => setShots([]);

  return (
    <div className="app">
      <aside className="sidebar">
        <header className="brand">
          <h1>AZ Fire Lookouts</h1>
        </header>

        <ShotInput onAddShot={addShot} />
        <ShotList shots={shots} onRemoveShot={removeShot} onClearAll={clearAll} />

        <footer className="hint">
          Right-click the map to copy coordinates.
        </footer>
      </aside>

      <main className="map-area">
        <Map shots={shots} />
      </main>
    </div>
  );
}