import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import Hls from 'hls.js';
import 'leaflet/dist/leaflet.css';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

const MapComponent = ({ camData }) => {
  const [map, setMap] = useState(null);
  const [activeCameraId, setActiveCameraId] = useState(null);

  useEffect(() => {
    const initializeTF = async () => {
      await tf.ready();
      
      // Set WebGL memory limit
      tf.env().set('WEBGL_MAX_TEXTURE_SIZE', 1024);

      // Set WebGL backend or fallback to CPU
      await tf.setBackend('webgl').catch(() => tf.setBackend('cpu'));
    };

    initializeTF();

    const initMap = L.map('camera-sensor-map').setView([43.063, -89.42], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(initMap);

    setMap(initMap);

    return () => {
      initMap.remove();
    };
  }, []);

  useEffect(() => {
    if (map && camData) {
      camData.forEach(ele => {
        const marker = L.marker(ele.location, { icon: new L.Icon({ iconUrl: `./icon/Version-2/basic.png`, iconSize: [48, 48] }) }).addTo(map);
        marker.on('click', () => {
          if (activeCameraId === ele.id) {
            setActiveCameraId(null); // Reset ID to ensure the popup can reopen
          } else {
            setActiveCameraId(ele.id);
            map.setView(ele.location, 16, { animate: true });
          }
        });
      });
    }
  }, [map, camData, activeCameraId]);

  useEffect(() => {
    if (activeCameraId && map && camData) {
      const ele = camData.find(cam => cam.id === activeCameraId);
      if (ele) {
        const popupContent = getPopupContent(ele);
        const popup = L.popup({
          maxWidth: 500,
          maxHeight: 300,
          className: 'custom-popup'
        }).setLatLng(ele.location)
          .setContent(popupContent)
          .openOn(map);
        
        // Add close event listener to reset activeCameraId
        popup.on('remove', () => setActiveCameraId(null));
        
        initializeVideoPlayer(`video-${ele.id}`);
      }
    }
  }, [activeCameraId, map, camData]); // Properly handle activeCameraId updates

  const getPopupContent = (ele) => {
    const videoSrc = ele.id === "0175"
      ? `https://cctv1.dot.wi.gov:443/rtplive/CCTV-13-${ele.id}/playlist.m3u8`
      : `https://cctv2.dot.wi.gov:443/rtplive/CCTV-13-${ele.id}/playlist.m3u8`;
    return `
      <div class="popup-wrapper">
        <h2 class="popup-header">${ele.name}</h2>
        <video id="video-${ele.id}" width="480" controls autoplay muted>
          <source src="${videoSrc}" type="application/x-mpegURL">
        </video>
      </div>`;
  };

  const initializeVideoPlayer = (videoId) => {
    const videoElement = document.getElementById(videoId);
    if (videoElement && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(videoElement.querySelector('source').src);
      hls.attachMedia(videoElement);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoElement.play().catch(err => console.error('Error playing video:', err));

        // Start car detection loop
        setInterval(async () => {
          const predictions = await detectCars(videoElement);
          trackCarMovement(predictions);
        }, 1000);
      });
    } else if (videoElement && videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      videoElement.play().catch(err => console.error('Error playing video:', err));
    }
  };

  return <div id="camera-sensor-map" style={{ height: '500px' }} />;
};

const detectCars = async (videoElement) => {
  const model = await cocoSsd.load();
  const predictions = await model.detect(videoElement);
  return predictions.filter(p => p.class === 'car' || p.class === 'truck');
};

let lastPositions = {};

const trackCarMovement = (predictions) => {
  predictions.forEach(prediction => {
    const { bbox } = prediction; // [x, y, width, height]
    const id = bbox.toString();
    
    if (lastPositions[id]) {
      const [lastX, lastY] = lastPositions[id];
      const [currentX, currentY] = [bbox[0], bbox[1]];

      if (Math.abs(currentX - lastX) < 5 && Math.abs(currentY - lastY) < 5) {
        console.log('Car stopped:', prediction);
      }
    }

    lastPositions[id] = [bbox[0], bbox[1]];
  });
};

export default MapComponent;
