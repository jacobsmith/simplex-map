import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

type SignalReport = {
  timestamp: number;
  heard_callsign: string;
  reporting_callsign: string;
  readability: number;
  strength: number;
  notes?: string;
};

interface SignalReportFormProps {
  onSubmit: () => void;
  sessionId?: string;
}

const SignalReportForm: React.FC<SignalReportFormProps> = ({
  onSubmit,
  sessionId,
}) => {
  const [heardCallsign, setHeardCallsign] = useState("");
  const [readability, setReadability] = useState("5");
  const [strength, setStrength] = useState("9");
  const [operatorInfo, setOperatorInfo] = useState<any>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    // Load operator info from localStorage
    const savedOperatorInfo = localStorage.getItem("operatorInfo");
    if (savedOperatorInfo) {
      setOperatorInfo(JSON.parse(savedOperatorInfo));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!operatorInfo) {
      alert(
        "Operator information not found. Please set up your station first."
      );
      return;
    }

    const report = {
      reporting_callsign: operatorInfo.callsign,
      heard_callsign: heardCallsign.toUpperCase(),
      readability: parseInt(readability),
      strength: parseInt(strength),
      notes: notes.trim(),
      created_at: new Date().toISOString(),
      session_id: sessionId,
    };

    const { data, error } = await supabase
      .from("signal_reports")
      .insert([report]);

    if (error) {
      console.error("Error submitting report:", error);
      // Handle error appropriately
      return;
    }

    // Clear form
    setHeardCallsign("");
    setReadability("5");
    setStrength("9");
    setNotes("");

    if (onSubmit) onSubmit();
  };

  if (!operatorInfo) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <p className="text-red-600 font-semibold">
          Please set up your station first
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Submit Signal Report</h2>
      <p className="mb-6 text-gray-700 font-medium">
        Reporting as:{" "}
        <span className="font-semibold">{operatorInfo.callsign}</span>
      </p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 font-medium">Heard Callsign:</label>
          <input
            type="text"
            value={heardCallsign}
            onChange={(e) => setHeardCallsign(e.target.value.toUpperCase())}
            className="border p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter callsign you heard"
            required
          />
        </div>
        <div className="flex gap-6">
          <div>
            <label className="block mb-2 font-medium">Readability (1-5):</label>
            <select
              value={readability}
              onChange={(e) => setReadability(e.target.value)}
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2 font-medium">Strength (1-9):</label>
            <select
              value={strength}
              onChange={(e) => setStrength(e.target.value)}
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mb-6">
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Notes (optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            placeholder="Antenna type, mobile/base, power level, etc."
            rows={3}
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Submit Report
        </button>
      </form>
    </div>
  );
};

export default SignalReportForm;
