import React from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const center = {
  lat: 0, // Set a default latitude
  lng: 0, // Set a default longitude
};

const locations = [
  { lat: 34.0522, lng: -118.2437, callsign: "K6XYZ" },
  { lat: 40.7128, lng: -74.006, callsign: "W2ABC" },
  // Add more locations as needed
];

const Home: React.FC = () => {
  return (
    <>
      <h1>Simplex Map</h1>
      <p>A map of simplex radios in the area.</p>
      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={5}
        >
          {locations.map((location, index) => (
            <Marker
              key={index}
              position={{ lat: location.lat, lng: location.lng }}
              label={location.callsign}
            />
          ))}
        </GoogleMap>
      </LoadScript>
    </>
  );
};

export default Home;
