import React, { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import MapComponent from './MapComponent'; 
import camData from './camData'; 
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';

function App() {
  useEffect(() => {
    const initializeTF = async () => {
      await tf.ready();

      // Set WebGL memory limit and fallback to CPU if needed
      tf.env().set('WEBGL_MAX_TEXTURE_SIZE', 2048);
      await tf.setBackend('webgl').catch(() => tf.setBackend('cpu'));
    };
    initializeTF();
  }, []);
  
  return (
    <div className="App">
      <MapComponent camData={camData} />
    </div>
  );
}

export default App;