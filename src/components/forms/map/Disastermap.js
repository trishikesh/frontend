// components/forms/map/Disastermap.js
"use client";

import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useEffect } from 'react';
import axios from 'axios';

// Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const DisasterMap = ({ userLocation }) => {
  const [disasters, setDisasters] = useState([]);
  const [reliefCenters] = useState([
    {
      id: 1,
      name: 'EMSPLUS AMBULANCE SERVICES',
      position: [26.918292, 75.808222],
      type: 'hospital'
    },
    {
      id: 2,
      name: 'Chauhan ambulance service (Tb hospital)',
      position: [26.921222, 75.812333],
      type: 'hospital'
    },
    {
      id: 3,
      name: 'Chauhan Ambulance service (Shastri Nagar Rd)',
      position: [26.921222, 75.812333],
      type: 'hospital'
    }
  ]);
  const [routes, setRoutes] = useState([]);
  const [heatmapData, setHeatmapData] = useState(null);
  const [severityRadius, setSeverityRadius] = useState(2); // in km

  // Generate severity heatmap data
  const generateSeverityHeatmap = () => {
    const points = [];
    const centerLat = userLocation[0];
    const centerLng = userLocation[1];
    
    // Generate random points within the severity radius
    for (let i = 0; i < 100; i++) {
      // Random angle and distance
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * severityRadius;
      
      // Convert distance to latitude/longitude offsets
      const latOffset = (distance / 110.574) * Math.cos(angle);
      const lngOffset = (distance / (111.320 * Math.cos(centerLat * Math.PI / 180))) * Math.sin(angle);
      
      const pointLat = centerLat + latOffset;
      const pointLng = centerLng + lngOffset;
      
      // Severity decreases with distance from center
      const severity = 1 - (distance / severityRadius);
      
      points.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [pointLng, pointLat]
        },
        properties: {
          severity: severity
        }
      });
    }
    
    // Add center point with maximum severity
    points.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [centerLng, centerLat]
      },
      properties: {
        severity: 1
      }
    });
    
    setHeatmapData({
      type: 'FeatureCollection',
      features: points
    });
  };

  // Calculate routes using OSRM API
  const calculateRoutes = async () => {
    const coordinates = reliefCenters.map(c => `${c.position[1]},${c.position[0]}`).join(';');
    try {
      const response = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${userLocation[1]},${userLocation[0]};${coordinates}?geometries=geojson`
      );
      setRoutes(response.data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]));
    } catch (error) {
      console.error('Routing error:', error);
    }
  };

  // Heatmap style function
  const pointToLayer = (feature, latlng) => {
    const severity = feature.properties.severity;
    const radius = severity * 10; // Bigger dots for higher severity
    
    // Color gradient from red (high) to yellow (medium) to green (low)
    const hue = (1 - severity) * 120; // 0 (red) to 120 (green)
    const color = `hsl(${hue}, 100%, 50%)`;
    
    return L.circleMarker(latlng, {
      radius: radius,
      fillColor: color,
      color: color,
      weight: 1,
      opacity: 1,
      fillOpacity: 0.7
    });
  };

  useEffect(() => {
    if (userLocation) {
      generateSeverityHeatmap();
      calculateRoutes();
      
      // Simulate loading disasters
      const timer = setTimeout(() => {
        setDisasters([{
          id: 1,
          lat: userLocation[0] + 0.01,
          lng: userLocation[1] + 0.01,
          type: 'fire',
          intensity: 'medium',
          timestamp: new Date().toISOString()
        }]);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [userLocation, severityRadius]);

  return (
    <div className="h-full w-full rounded-lg overflow-hidden">
      <MapContainer
        center={userLocation}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* Severity Heatmap */}
        {heatmapData && (
          <GeoJSON
            data={heatmapData}
            pointToLayer={pointToLayer}
          />
        )}

        {/* Severity Radius Circle */}
        <Circle
          center={userLocation}
          radius={severityRadius * 1000} // Convert km to meters
          color="red"
          fillColor="red"
          fillOpacity={0.1}
          weight={2}
        />

        {/* User Location Marker */}
        <Marker position={userLocation}>
          <Popup>Your Current Location</Popup>
        </Marker>

        {/* Disasters */}
        {disasters.map(disaster => (
          <Marker
            key={disaster.id}
            position={[disaster.lat, disaster.lng]}
            icon={new L.Icon({
              iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${
                { fire: 'red', flood: 'blue', earthquake: 'orange' }[disaster.type] || 'gray'
              }.png`,
              iconSize: [25, 41],
              iconAnchor: [12, 41]
            })}
          >
            <Popup>
              <div>
                <h3>{disaster.type.toUpperCase()} ALERT</h3>
                <p>Intensity: {disaster.intensity}</p>
                <p>Severity Radius: {severityRadius} km</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Relief Centers */}
        {reliefCenters.map(center => (
          <Marker
            key={center.id}
            position={center.position}
            icon={new L.Icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41]
            })}
          >
            <Popup>
              <div>
                <h3>{center.name}</h3>
                <p>Type: Ambulance Service</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Routes */}
        {routes.length > 0 && (
          <Polyline
            positions={routes}
            color="blue"
            weight={3}
            dashArray="5, 5"
          />
        )}
      </MapContainer>

      {/* Severity Control */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-gray-800 p-3 rounded-lg shadow-lg">
        <label className="block text-sm text-white mb-1">Severity Radius: {severityRadius} km</label>
        <input
          type="range"
          min="1"
          max="10"
          value={severityRadius}
          onChange={(e) => setSeverityRadius(parseInt(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default DisasterMap;