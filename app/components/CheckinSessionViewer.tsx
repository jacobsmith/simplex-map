import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { CheckinSession, SessionParticipant } from "../types";

interface CheckinSessionViewerProps {
  selectedSession?: CheckinSession | null;
}

const CheckinSessionViewer: React.FC<CheckinSessionViewerProps> = ({
  selectedSession: initialSession,
}) => {
  const [sessions, setSessions] = useState<CheckinSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<CheckinSession | null>(
    initialSession || null
  );
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);

  useEffect(() => {
    fetchSessions();
    const channel = supabase
      .channel("checkin_sessions")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "checkin_sessions",
        },
        () => {
          fetchSessions();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (selectedSession) {
      fetchParticipants();
      const channel = supabase
        .channel("session_participants")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "session_participants",
            filter: `session_id=eq.${selectedSession.id}`,
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
  }, [selectedSession]);

  const fetchSessions = async () => {
    const { data, error } = await supabase
      .from("checkin_sessions")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching sessions:", error);
      return;
    }

    setSessions(data || []);

    // If no session is selected and we have sessions, select the first one
    if (!selectedSession && data && data.length > 0) {
      setSelectedSession(data[0]);
    }
  };

  const fetchParticipants = async () => {
    if (!selectedSession) return;

    const { data, error } = await supabase
      .from("session_participants")
      .select("*")
      .eq("session_id", selectedSession.id)
      .is("left_at", null)
      .order("joined_at", { ascending: true });

    if (error) {
      console.error("Error fetching participants:", error);
      return;
    }

    setParticipants(data || []);
  };

  return (
    <div className=" flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div></div>
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
          {selectedSession && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-bold">{selectedSession.name}</h3>
                <p className="text-sm text-gray-600">
                  Region: {selectedSession.region}
                </p>
                <p className="text-sm text-gray-600">
                  Net Control: {selectedSession.created_by}
                </p>
              </div>

              <div className="mt-6">
                <h4 className="text-md font-semibold mb-3">
                  Current Participants ({participants.length})
                </h4>
                <div className="space-y-2">
                  {participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="p-2 bg-gray-50 rounded"
                    >
                      <p className="font-medium">{participant.callsign}</p>
                      <p className="text-xs text-gray-500">
                        Joined:{" "}
                        {new Date(participant.joined_at).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckinSessionViewer;
