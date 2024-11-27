import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { CheckinSession, SessionParticipant } from "../types";

interface CheckinSessionManagerProps {
  operatorCallsign: string;
  currentSession: CheckinSession | null;
  onSessionChange: (session: CheckinSession | null) => void;
  coordinates: { lat: number; lng: number };
}

const CheckinSessionManager: React.FC<CheckinSessionManagerProps> = ({
  operatorCallsign,
  currentSession,
  onSessionChange,
  coordinates,
}) => {
  const [sessions, setSessions] = useState<CheckinSession[]>([]);
  const [showNewSessionForm, setShowNewSessionForm] = useState(false);
  const [newSession, setNewSession] = useState({
    name: "",
    description: "",
    region: "",
  });
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (currentSession) {
      fetchParticipants();
      const channel = supabase
        .channel("session_participants")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "session_participants",
            filter: `session_id=eq.${currentSession.id}`,
          },
          () => {
            fetchParticipants();
          }
        )
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    }
  }, [currentSession]);

  const fetchSessions = async () => {
    const { data, error } = await supabase
      .from("checkin_sessions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching sessions:", error);
      return;
    }

    setSessions(data || []);
  };

  const fetchParticipants = async () => {
    if (!currentSession) return;

    const { data, error } = await supabase
      .from("session_participants")
      .select("*")
      .eq("session_id", currentSession.id)
      .is("left_at", null);

    if (error) {
      console.error("Error fetching participants:", error);
      return;
    }

    setParticipants(data || []);
  };

  const createSession = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase
      .from("checkin_sessions")
      .insert([
        {
          ...newSession,
          created_by: operatorCallsign,
          start_time: new Date().toISOString(),
          is_active: true,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating session:", error);
      return;
    }

    const { error: participantError } = await supabase
      .from("session_participants")
      .insert([
        {
          session_id: data.id,
          callsign: operatorCallsign,
          latitude: coordinates.lat,
          longitude: coordinates.lng,
        },
      ]);

    if (participantError) {
      console.error("Error adding user as participant:", participantError);
      return;
    }

    setShowNewSessionForm(false);
    setNewSession({ name: "", description: "", region: "" });
    fetchSessions();
    onSessionChange(data);
  };

  const joinSession = async (session: CheckinSession) => {
    // Check if the participant already exists in the session
    const { data: existingParticipant, error: fetchError } = await supabase
      .from("session_participants")
      .select("*")
      .eq("session_id", session.id)
      .eq("callsign", operatorCallsign);

    if (fetchError) {
      console.error("Error checking existing participant:", fetchError);
      return;
    }

    // If the participant does not exist, insert a new entry
    if (existingParticipant.length === 0) {
      const { error: participantError } = await supabase
        .from("session_participants")
        .insert([
          {
            session_id: session.id,
            callsign: operatorCallsign,
            latitude: coordinates.lat,
            longitude: coordinates.lng,
          },
        ]);

      if (participantError) {
        console.error("Error joining session:", participantError);
        return;
      }
    }

    onSessionChange(session);
  };

  const leaveSession = async () => {
    if (!currentSession) return;

    onSessionChange(null);
  };

  return (
    <div className="mb-4 p-4 border rounded">
      <h2 className="text-xl mb-4">Check-in Session</h2>

      {currentSession ? (
        <div>
          <p>Current session: {currentSession.name}</p>
          <p>Region: {currentSession.region}</p>
          <div className="mt-4">
            <h3 className="text-lg mb-2">Active Participants</h3>
            <div className="space-y-2">
              {participants.map((participant) => (
                <div key={participant.id} className="text-sm">
                  {participant.callsign}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={leaveSession}
            className="bg-red-500 text-white px-2 py-1 rounded text-sm mt-4"
          >
            Leave Session
          </button>
        </div>
      ) : (
        <div>
          <button
            onClick={() => setShowNewSessionForm(!showNewSessionForm)}
            className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
          >
            Create New Session
          </button>

          {showNewSessionForm && (
            <form onSubmit={createSession} className="space-y-4">
              <input
                type="text"
                placeholder="Session Name"
                value={newSession.name}
                onChange={(e) =>
                  setNewSession({ ...newSession, name: e.target.value })
                }
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="text"
                placeholder="Region (e.g., County/State)"
                value={newSession.region}
                onChange={(e) =>
                  setNewSession({ ...newSession, region: e.target.value })
                }
                className="w-full p-2 border rounded"
                required
              />
              <textarea
                placeholder="Description"
                value={newSession.description}
                onChange={(e) =>
                  setNewSession({ ...newSession, description: e.target.value })
                }
                className="w-full p-2 border rounded"
              />
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Create Session
              </button>
            </form>
          )}

          <div className="mt-4">
            <h3 className="text-lg mb-2">Active Sessions</h3>
            {sessions
              .filter((s) => s.is_active)
              .map((session) => (
                <div key={session.id} className="p-2 border rounded mb-2">
                  <p className="font-bold">{session.name}</p>
                  <p className="text-sm">{session.region}</p>
                  <button
                    onClick={() => joinSession(session)}
                    className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                  >
                    Join Session
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckinSessionManager;
