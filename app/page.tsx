"use client";

import React, { useEffect } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  useJsApiLoader,
  Polyline,
} from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const center = {
  lat: 39.8617, // Hamilton County, Indianapolis
  lng: -86.143, // Hamilton County, Indianapolis
};

type User = {
  lat: number;
  lng: number;
  callsign: string;
};
const users: Record<string, User> = {
  W9ABC: { lat: 39.9612, lng: -86.1527, callsign: "W9ABC" },
  KD9XYZ: { lat: 39.9559, lng: -85.9589, callsign: "KD9XYZ" },
  N9DEF: { lat: 39.9339, lng: -86.015, callsign: "N9DEF" },
  KC9GHI: { lat: 40.0445, lng: -86.1275, callsign: "KC9GHI" },
  WB9JKL: { lat: 39.8947, lng: -86.0672, callsign: "WB9JKL" },
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
];

const receivedCommunications: Record<string, string[]> = {
  W9ABC: ["KD9XYZ", "N9DEF", "KC9GHI"],
  KD9XYZ: ["W9ABC", "N9DEF", "WB9JKL"],
  N9DEF: ["W9ABC", "KD9XYZ", "KC9GHI"],
  KC9GHI: ["W9ABC", "N9DEF", "WB9JKL"],
  WB9JKL: ["KD9XYZ", "KC9GHI"],
};

const Home: React.FC = () => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  const [map, setMap] = React.useState(null);
  const [selectedUser, setSelectedUser] = React.useState<string | null>(null);
  const [polylines, setPolylines] = React.useState<any>([]);

  useEffect(() => {
    if (selectedUser) {
      console.log("🚀 ~ useEffect ~ selectedUser:", selectedUser);
      const callsignsUserCanHear = receivedCommunications[selectedUser];
      const polylines = callsignsUserCanHear.map((callsign) => {
        return {
          path: [
            { lat: users[selectedUser].lat, lng: users[selectedUser].lng },
            { lat: users[callsign].lat, lng: users[callsign].lng },
          ],
        };
      });

      console.log("🚀 ~ useEffect ~ polylines:", polylines);

      setPolylines(polylines);
    }
  }, [selectedUser]);

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
        zoom={11}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {locations.map((location, index) => (
          <Marker
            key={index}
            position={{ lat: location.lat, lng: location.lng }}
            label={location.callsign}
            onClick={() => {
              setSelectedUser(location.callsign);
            }}
          />
        ))}
        {selectedUser &&
          polylines.map((polyline) => (
            <Polyline
              key={selectedUser + JSON.stringify(polyline.path)}
              path={polyline.path}
              options={{
                strokeColor: Math.random() < 0.5 ? "#FF0000" : "#00FF00",
                strokeOpacity: 0.8,
                strokeWeight: 2,
              }}
            />
          ))}
      </GoogleMap>
    </>
  ) : (
    <></>
  );
};

export default Home;
