import L from 'leaflet';

// Define the base icon configuration
const baseIcon = L.Icon.extend({
  options: {
    popupAnchor: [0, -20], // Customize as needed
    // Define common options here, if any
  },
});

// Function to get the URL based on type
const getIconUrl = (type) => {
  switch(type) {
    case 'cloudy':
      return "./icon/Version-2/cloudy.png";
    case 'foggy':
      return "./icon/Version-2/foggy.png";
    case 'rainy':
      return "./icon/Version-2/rainy.png";
    case 'snowy':
      return "./icon/Version-2/snowy.png";
    case 'accident':
      return "./icon/Version-2/accident.png";
    default: // 'basic' and any other unspecified type
      return "./icon/Version-2/basic.png";
  }
};

// Function to get icon size based on type
const getIconSize = (type) => {
  return type === 'accident' ? [55, 55] : [48, 48]; // Customize sizes as needed
};

// CameraIcon component returns a Leaflet icon
const CameraIcon = ({ type }) => {
  const iconUrl = getIconUrl(type);
  const iconSize = getIconSize(type);
  
  const icon = new baseIcon({ iconUrl, iconSize });
  
  return icon;
};

export default CameraIcon;