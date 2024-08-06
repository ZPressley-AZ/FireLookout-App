// src/MapComponent.js
import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Reference the custom icon from the public directory
const lookoutIconUrl = process.env.PUBLIC_URL + '/lookout-icon.png';

const lookouts = [
    { id: 1, name: "Elden", position: [35.24111154104116, -111.59749862482296] },
    { id: 2, name: "Woody Mountain", position: [35.14231243022519, -111.75150933739845] },
    { id: 3, name: "O'Leary", position: [35.40155925184233, -111.5264715755759] },
    { id: 4, name: "East Pocket", position: [34.97566489827702, -111.76845410066042] },
    { id: 5, name: "Hutch", position: [34.80202889704346, -111.39023468274047] },
    { id: 6, name: "Turkey Butte", position: [35.03210094789717, -111.90409814519013] },
    { id: 7, name: "Moqui", position: [34.56484891073119, -111.16910682163653] },
    { id: 8, name: "Volunteer", position: [35.21808538398121, -111.895503230324] },
    { id: 9, name: "Apache Maid", position: [34.72540870777329, -111.55060462850463] },
  ];

  const MapComponent = () => {
    const [selectedLookout, setSelectedLookout] = useState(lookouts[0].id);
    const [azimuth, setAzimuth] = useState('');
    const [distance, setDistance] = useState(25); // Default distance in miles
    const [lines, setLines] = useState([]);
  
    // Create a custom icon
    const lookoutIcon = L.icon({
      iconUrl: lookoutIconUrl,
      iconSize: [32, 32], // Size of the icon
      iconAnchor: [16, 32], // Point of the icon which will correspond to marker's location
      popupAnchor: [0, -32] // Point from which the popup should open relative to the iconAnchor
    });
  
    const handleAzimuthSubmit = (e) => {
      e.preventDefault();
  
      // Find the selected lookout's position
      const lookout = lookouts.find(l => l.id === parseInt(selectedLookout));
  
      if (!lookout || !azimuth || !distance) return;
  
      // Convert miles to kilometers
      const distanceKm = distance * 1.60934;
  
      // Calculate the endpoint of the azimuth line using the distance in kilometers
      const azimuthRad = (azimuth * Math.PI) / 180;
  
      const endLat = lookout.position[0] + (distanceKm / 111) * Math.cos(azimuthRad);
      const endLng = lookout.position[1] + (distanceKm / 111) * Math.sin(azimuthRad) / Math.cos(lookout.position[0] * Math.PI / 180);
  
      const newLine = {
        start: lookout.position,
        end: [endLat, endLng],
      };
  
      setLines([...lines, newLine]);
    };
  
    const handleRightClick = (event) => {
      // Extract latitude and longitude from the map event
      const { lat, lng } = event.latlng;
      alert(`${lat}, ${lng}`);
    };
  
    return (
      <div>
        <form onSubmit={handleAzimuthSubmit}>
          <label>
            Select Lookout:
            <select value={selectedLookout} onChange={(e) => setSelectedLookout(e.target.value)}>
              {lookouts.map(lookout => (
                <option key={lookout.id} value={lookout.id}>{lookout.name}</option>
              ))}
            </select>
          </label>
          <label>
            Azimuth (degrees):
            <input
              type="number"
              value={azimuth}
              onChange={(e) => setAzimuth(e.target.value)}
              min="0"
              max="360"
              step="1"
              required
            />
          </label>
          <label>
            Distance (miles):
            <input
              type="number"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              min="1"
              step="0.1"
              required
            />
          </label>
          <button type="submit">Plot Azimuth</button>
        </form>
  
        <MapContainer 
          center={[35.198271550857754, -111.65139331180428]} 
          zoom={13} 
          style={{ height: '100vh', width: '100%' }}
          whenReady={(map) => {
            map.target.on('contextmenu', handleRightClick);
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {lookouts.map(lookout => (
            <Marker
              key={lookout.id}
              position={lookout.position}
              icon={lookoutIcon} // Apply the custom icon here
            >
              <Popup>
                {lookout.name}
              </Popup>
            </Marker>
          ))}
          {lines.map((line, index) => (
            <Polyline key={index} positions={[line.start, line.end]} color="red" />
          ))}
        </MapContainer>
      </div>
    );
  };
  
  export default MapComponent;