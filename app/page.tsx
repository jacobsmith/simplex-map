"use client";

import React, { useEffect } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { supabase } from "../lib/supabaseClient";
import SignalReportForm from "./components/SignalReportForm";
import OperatorSetupForm from "./components/OperatorSetupForm";
import RecentReports from "./components/RecentReports";
import SimplexMap from "./components/SimplexMap";
import { drawCommunicationLines } from "./utils/mapUtils";
import { SignalReport, OperatorInfo, CheckinSession } from "./types";
import {
  findStationsHeardBy,
  findStationsWhoCanHear,
} from "./utils/stationUtils";
import CheckinSessionManager from "./components/CheckinSessionManager";
import { runDemo } from "./utils/demoScript";
import Stepper from "./components/Stepper";
import CheckinSessionViewer from "./components/CheckinSessionViewer";

// TODO: pop up stations as they log in

const Home: React.FC = () => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  const [isDemo, setIsDemo] = React.useState(false);
  const [map, setMap] = React.useState(null);
  const [reports, setReports] = React.useState<SignalReport[]>([]);
  const [operatorInfo, setOperatorInfo] = React.useState<OperatorInfo | null>(
    null
  );
  const [selectedStation, setSelectedStation] = React.useState<string | null>(
    null
  );
  const [showingHeardBy, setShowingHeardBy] = React.useState(true);
  const [lines, setLines] = React.useState<google.maps.Polyline[]>([]);
  const [labelSize, setLabelSize] = React.useState(12); // Default label size
  const [currentSession, setCurrentSession] =
    React.useState<CheckinSession | null>(null);
  const [operatorLocations, setOperatorLocations] = React.useState<
    { callsign: string; coordinates: { lat: number; lng: number } }[]
  >([]);

  const handleMarkerClick = (callsign: string) => {
    if (selectedStation === callsign) {
      // Toggle between showing who can hear this station and who this station can hear
      setShowingHeardBy(!showingHeardBy);
    } else {
      // New station selected, show who can hear it
      setSelectedStation(callsign);
      setShowingHeardBy(true);
    }
  };

  useEffect(() => {
    // Initial fetch of reports
    const fetchReports = async () => {
      let query = supabase
        .from("signal_reports")
        .select("*")
        .order("created_at", { ascending: false });

      // If there's a current session, filter reports for that session
      if (currentSession) {
        query = query.eq("session_id", currentSession.id);
      } else {
        query = query.is("session_id", null);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching reports:", error);
        return;
      }

      setReports(data || []);
    };

    fetchReports();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("signal_reports")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "signal_reports",
          filter: currentSession
            ? `session_id=eq.${currentSession.id}`
            : "session_id=is.null",
        },
        (payload: { new: SignalReport }) => {
          console.log("New report:", payload.new);
          setReports((currentReports) => [payload.new, ...currentReports]);
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      channel.unsubscribe();
    };
  }, [currentSession]);

  useEffect(() => {
    const fetchParticipants = async () => {
      if (currentSession) {
        const { data, error } = await supabase
          .from("session_participants")
          .select("*")
          .eq("session_id", currentSession.id);

        if (error) {
          console.error("Error fetching participants:", error);
          return;
        }

        const initialLocations = data.map((participant) => ({
          callsign: participant.callsign,
          coordinates: {
            lat: Number(participant.latitude),
            lng: Number(participant.longitude),
          },
        }));

        setOperatorLocations(initialLocations);
      }
    };

    fetchParticipants();

    // Subscribe to real-time updates for session participants
    const participantChannel = supabase
      .channel("session_participants")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "session_participants",
          filter: currentSession
            ? `session_id=eq.${currentSession.id}`
            : "session_id=is.null",
        },
        (payload: { new: any }) => {
          setOperatorLocations((prevLocations) => [
            ...prevLocations,
            {
              callsign: payload.new.callsign,
              coordinates: {
                lat: Number(payload.new.latitude),
                lng: Number(payload.new.longitude),
              },
            },
          ]);
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      participantChannel.unsubscribe();
    };
  }, [currentSession, map]);

  useEffect(() => {
    if (selectedStation) {
      lines.forEach((line) => line?.setMap(null));
      const stationsToShow = showingHeardBy
        ? findStationsHeardBy(selectedStation, reports)
        : findStationsWhoCanHear(selectedStation, reports);
      const newLines = drawCommunicationLines(
        selectedStation,
        stationsToShow,
        showingHeardBy ? "#FF0000" : "#00FF00",
        map,
        showingHeardBy,
        operatorLocations,
        operatorInfo
      );
      setLines(newLines);
    }
  }, [reports, selectedStation, showingHeardBy]);

  const handleOperatorSetup = (info: OperatorInfo) => {
    setOperatorInfo(info);
    // Optionally center the map on the operator's location
    if (map) {
      (map as google.maps.Map).setCenter(info.coordinates);
    }
  };

  const handleReportSubmitted = async () => {
    // The actual submission will now happen in the SignalReportForm component
    // This function can be used for any additional logic needed after submission
  };

  const onLoad = React.useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback() {
    setMap(null);
  }, []);

  const clearOperatorInfo = () => {
    localStorage.removeItem("operatorInfo");
    setOperatorInfo(null);
    setSelectedStation(null);
    setLines([]);
  };

  if (!operatorInfo) {
    return (
      <OperatorSetupForm
        onComplete={handleOperatorSetup}
        onDemoClick={() => {
          setIsDemo(true);
          runDemo(
            setOperatorInfo,
            clearOperatorInfo,
            setOperatorLocations,
            setReports,
            setSelectedStation,
            setShowingHeardBy
          );
        }}
      />
    );
  }

  if (!currentSession) {
    return (
      <CheckinSessionManager
        operatorCallsign={operatorInfo.callsign}
        currentSession={currentSession}
        onSessionChange={setCurrentSession}
        coordinates={operatorInfo.coordinates}
      />
    );
  }

  const handleEndDemo = () => {
    window.speechSynthesis.cancel();
    setIsDemo(false);
    clearOperatorInfo();
    setOperatorInfo(null);
    setSelectedStation(null);
    setLines([]);
  };

  return isLoaded ? (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl">Simplex Map</h1>
          <p>
            Operating as: {operatorInfo.callsign} from {operatorInfo.address}
          </p>
        </div>
        {isDemo && (
          <button
            onClick={handleEndDemo}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            End Demo
          </button>
        )}
      </div>

      {/* Label Size Control */}
      <div className="mb-4">
        <label
          htmlFor="labelSize"
          className="block text-sm font-medium text-gray-700"
        >
          Label Size
        </label>
        <input
          type="range"
          id="labelSize"
          name="labelSize"
          min="8"
          max="24"
          value={labelSize}
          onChange={(e) => setLabelSize(Number(e.target.value))}
          className="mt-1 block w-full"
        />
        <span className="text-sm text-gray-600">
          Current size: {labelSize}px
        </span>
      </div>

      {selectedStation && (
        <p className="mb-4 text-sm">
          Showing stations that {showingHeardBy ? "are heard by" : "can hear"}{" "}
          <span className="font-bold">{selectedStation}</span>{" "}
          <button
            onClick={() => {
              lines.forEach((line) => line?.setMap(null));
              setLines([]);
              setSelectedStation(null);
            }}
            className="text-blue-500 hover:text-blue-700"
          >
            (clear)
          </button>
        </p>
      )}

      {/* Map Section - Full Width */}
      <div className="mb-6 h-[800px] flex flex-col sm:flex-row">
        <div className="w-full sm:w-1/2">
          <SignalReportForm
            isDemo={isDemo}
            onSubmit={handleReportSubmitted}
            sessionId={currentSession?.id}
          />
        </div>
        <SimplexMap
          center={operatorInfo.coordinates}
          operatorInfo={operatorInfo}
          locations={operatorLocations}
          selectedStation={selectedStation}
          showingHeardBy={showingHeardBy}
          labelSize={labelSize}
          onMarkerClick={handleMarkerClick}
          onLoad={onLoad}
          onUnmount={onUnmount}
        />
      </div>

      {/* Session Viewer and Reports - Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Session Info */}
        <div>
          {!isDemo && <CheckinSessionViewer selectedSession={currentSession} />}
          <div className="mt-4 space-x-2">
            <button
              onClick={clearOperatorInfo}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Clear Local Storage
            </button>
            <button
              onClick={() =>
                runDemo(
                  setOperatorInfo,
                  clearOperatorInfo,
                  setOperatorLocations,
                  setReports,
                  setSelectedStation,
                  setShowingHeardBy
                )
              }
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Run 30s Demo
            </button>
          </div>
        </div>

        {/* Right Column - Recent Reports */}
        <div>
          <RecentReports reports={reports} />
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
};

export default Home;
