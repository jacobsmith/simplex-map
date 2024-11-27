"use client";

import React, { useEffect } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  useJsApiLoader,
  Polyline,
} from "@react-google-maps/api";
import SignalReportForm from "./components/SignalReportForm";
import OperatorSetupForm from "./components/OperatorSetupForm";

const mapContainerStyle = {
  width: "100%",
  height: "800px",
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

// const receivedCommunications: Record<string, string[]> = {
//   W9ABC: ["KD9XYZ", "N9DEF", "KC9GHI"],
//   KD9XYZ: ["W9ABC", "N9DEF", "WB9JKL"],
//   N9DEF: ["W9ABC", "KD9XYZ", "KC9GHI"],
//   KC9GHI: ["W9ABC", "N9DEF", "WB9JKL"],
//   WB9JKL: ["KD9XYZ", "KC9GHI"],
// };

const Home: React.FC = () => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  const [map, setMap] = React.useState(null);
  const [reports, setReports] = React.useState<any[]>([]);
  const [operatorInfo, setOperatorInfo] = React.useState<any>(null);
  const [selectedStation, setSelectedStation] = React.useState<string | null>(
    null
  );
  const [showingHeardBy, setShowingHeardBy] = React.useState(true);
  const [lines, setLines] = React.useState<google.maps.Polyline[]>([]);

  // Function to find stations that can hear the selected station
  const findStationsWhoCanHear = (callsign: string) => {
    return reports
      .filter((report) => report.heardCallsign === callsign)
      .map((report) => report.reportingCallsign);
  };

  // Function to find stations that the selected station can hear
  const findStationsHeardBy = (callsign: string) => {
    return reports
      .filter((report) => report.reportingCallsign === callsign)
      .map((report) => report.heardCallsign);
  };

  // Function to draw communication lines
  const drawCommunicationLines = (
    fromCallsign: string,
    toCallsigns: string[],
    color: string
  ) => {
    // Clear existing lines
    lines.forEach((line) => line.setMap(null));

    if (!map) return;

    const newLines = toCallsigns.map((toCallsign) => {
      // Find the coordinates for both stations
      const fromStation =
        locations.find((loc) => loc.callsign === fromCallsign) ||
        (operatorInfo.callsign === fromCallsign ? operatorInfo : null);
      const toStation =
        locations.find((loc) => loc.callsign === toCallsign) ||
        (operatorInfo.callsign === toCallsign ? operatorInfo : null);

      if (!fromStation || !toStation) return null;

      const from = showingHeardBy ? toStation : fromStation;
      const to = showingHeardBy ? fromStation : toStation;

      return new google.maps.Polyline({
        path: [
          {
            lat: from.lat || from.coordinates.lat,
            lng: from.lng || from.coordinates.lng,
          },
          {
            lat: to.lat || to.coordinates.lat,
            lng: to.lng || to.coordinates.lng,
          },
        ],
        geodesic: true,
        strokeColor: color,
        strokeOpacity: 1.0,
        strokeWeight: 2,
        map: map as google.maps.Map,
        icons: [
          {
            icon: {
              path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 1.5,
            },
            offset: "100%",
          },
        ],
      });
    });

    setLines(newLines.filter(Boolean) as google.maps.Polyline[]);
  };

  const handleMarkerClick = (callsign: string) => {
    if (selectedStation === callsign) {
      // Toggle between showing who can hear this station and who this station can hear
      setShowingHeardBy(!showingHeardBy);
      const stationsToShow = showingHeardBy
        ? findStationsHeardBy(callsign)
        : findStationsWhoCanHear(callsign);
      drawCommunicationLines(
        callsign,
        stationsToShow,
        showingHeardBy ? "#FF0000" : "#00FF00"
      );
    } else {
      // New station selected, show who can hear it
      setSelectedStation(callsign);
      setShowingHeardBy(true);
      const stationsWhoCanHear = findStationsWhoCanHear(callsign);
      drawCommunicationLines(callsign, stationsWhoCanHear, "#00FF00");
    }
  };

  useEffect(() => {
    // Load operator info from localStorage
    const savedOperatorInfo = localStorage.getItem("operatorInfo");
    if (savedOperatorInfo) {
      setOperatorInfo(JSON.parse(savedOperatorInfo));
    }

    // Load reports from localStorage
    const savedReports = JSON.parse(
      localStorage.getItem("signalReports") || "[]"
    );
    setReports(savedReports);
  }, []);

  const handleOperatorSetup = (info: any) => {
    setOperatorInfo(info);
    // Optionally center the map on the operator's location
    if (map) {
      (map as google.maps.Map).setCenter(info.coordinates);
    }
  };

  const handleReportSubmitted = () => {
    const savedReports = JSON.parse(
      localStorage.getItem("signalReports") || "[]"
    );
    setReports(savedReports);

    if (selectedStation) {
      const stationsToShow = showingHeardBy
        ? findStationsHeardBy(selectedStation)
        : findStationsWhoCanHear(selectedStation);
      drawCommunicationLines(
        selectedStation,
        stationsToShow,
        showingHeardBy ? "#FF0000" : "#00FF00"
      );
    }
  };

  const onLoad = React.useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  const clearLocalStorage = () => {
    localStorage.removeItem("operatorInfo");
    localStorage.removeItem("signalReports");
    setOperatorInfo(null);
    setReports([]);
    setSelectedStation(null);
    setLines([]);
  };

  if (!operatorInfo) {
    return <OperatorSetupForm onComplete={handleOperatorSetup} />;
  }

  return isLoaded ? (
    <div className="p-4">
      <h1 className="text-3xl mb-4">Simplex Map</h1>
      <p className="mb-4">
        Operating as: {operatorInfo.callsign} from {operatorInfo.address}
      </p>
      {selectedStation && (
        <p className="mb-4 text-sm">
          Showing stations that {showingHeardBy ? "can hear" : "are heard by"}{" "}
          <span className="font-bold">{selectedStation}</span>{" "}
          <button
            onClick={() => {
              lines.forEach((line) => line.setMap(null));
              setLines([]);
              setSelectedStation(null);
            }}
            className="text-blue-500 hover:text-blue-700"
          >
            (clear)
          </button>
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={operatorInfo.coordinates}
            zoom={11}
            onLoad={onLoad}
            onUnmount={onUnmount}
          >
            {/* Operator's location marker */}
            <Marker
              position={operatorInfo.coordinates}
              label={operatorInfo.callsign}
              icon={{
                url: showingHeardBy
                  ? "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                  : "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
              }}
              onClick={() => handleMarkerClick(operatorInfo.callsign)}
            />

            {/* Other station markers */}
            {locations.map((location, index) => (
              <Marker
                key={index}
                position={{ lat: location.lat, lng: location.lng }}
                label={location.callsign}
                onClick={() => handleMarkerClick(location.callsign)}
                icon={{
                  url:
                    selectedStation === location.callsign
                      ? showingHeardBy
                        ? "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                        : "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                      : "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                }}
              />
            ))}
          </GoogleMap>
        </div>
        <div className="space-y-4">
          <SignalReportForm onSubmit={handleReportSubmitted} />

          <div className="bg-white rounded shadow p-4">
            <h2 className="text-xl mb-4">Recent Reports</h2>
            <div className="space-y-2">
              {reports
                .slice(-5)
                .reverse()
                .map((report, index) => (
                  <div key={index} className="border-b pb-2">
                    <p className="font-bold">
                      {report.reportingCallsign} → {report.heardCallsign}
                    </p>
                    <p className="text-sm text-gray-600">
                      Signal: {report.readability} by {report.strength}
                      <br />
                      {new Date(report.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
            </div>
          </div>

          {/* Clear Local Storage Button */}
          <button
            onClick={clearLocalStorage}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Clear Local Storage
          </button>
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
};

export default Home;
