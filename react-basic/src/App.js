import React from 'react';
import 'leaflet/dist/leaflet.css';
import MapComponent from './MapComponent'; 
import camData from './camData'; 

function App() {
  return (
    <div className="App">
      <MapComponent camData={camData} />
    </div>
  );
}

export default App;