"use client";

import React from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const center = {
  lat: 39.8617, // Hamilton County, Indianapolis
  lng: -86.143, // Hamilton County, Indianapolis
};

const locations = [
  {
    lat: 39.9612, // Carmel
    lng: -86.1527,
    callsign: "W9ABC",
  },
  {
    lat: 39.9559, // Fishers
    lng: -85.9589,
    callsign: "KD9XYZ",
  },
  {
    lat: 39.9339, // Noblesville
    lng: -86.015,
    callsign: "N9DEF",
  },
  {
    lat: 40.0445, // Westfield
    lng: -86.1275,
    callsign: "KC9GHI",
  },
  {
    lat: 39.8947, // Southern Hamilton County
    lng: -86.0672,
    callsign: "WB9JKL",
  },

  // Add more locations as needed
];

const Home: React.FC = () => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  const [map, setMap] = React.useState(null);

  const onLoad = React.useCallback(function callback(map) {
    const bounds = new window.google.maps.LatLngBounds(center);
    map.fitBounds(bounds);
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  return isLoaded ? (
    <>
      <h1>Simplex Map</h1>
      <p>A map of simplex radios in the area.</p>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={5}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {locations.map((location, index) => (
          <Marker
            key={index}
            position={{ lat: location.lat, lng: location.lng }}
            label={location.callsign}
          />
        ))}
      </GoogleMap>
    </>
  ) : (
    <></>
  );
};

export default Home;
