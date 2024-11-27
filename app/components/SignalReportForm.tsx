import React, { useState, useEffect } from "react";

type SignalReport = {
  timestamp: number;
  heardCallsign: string;
  reportingCallsign: string;
  readability: number;
  strength: number;
  notes?: string;
};

interface SignalReportFormProps {
  onSubmit: () => void;
}

const SignalReportForm: React.FC<SignalReportFormProps> = ({ onSubmit }) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!operatorInfo) {
      alert(
        "Operator information not found. Please set up your station first."
      );
      return;
    }

    const report: SignalReport = {
      timestamp: Date.now(),
      heardCallsign: heardCallsign.toUpperCase(),
      reportingCallsign: operatorInfo.callsign,
      readability: parseInt(readability),
      strength: parseInt(strength),
      notes: notes.trim(),
    };

    // Get existing reports from localStorage
    const existingReports = JSON.parse(
      localStorage.getItem("signalReports") || "[]"
    );

    // Add new report
    localStorage.setItem(
      "signalReports",
      JSON.stringify([...existingReports, report])
    );

    // Clear form
    setHeardCallsign("");
    setReadability("5");
    setStrength("9");
    setNotes("");

    onSubmit();
  };

  if (!operatorInfo) {
    return (
      <div className="p-4 bg-white rounded shadow">
        <p className="text-red-500">Please set up your station first</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl mb-4">Submit Signal Report</h2>
      <p className="mb-4 text-gray-600">
        Reporting as: {operatorInfo.callsign}
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Heard Callsign:</label>
          <input
            type="text"
            value={heardCallsign}
            onChange={(e) => setHeardCallsign(e.target.value.toUpperCase())}
            className="border p-2 w-full rounded"
            placeholder="Enter callsign you heard"
            required
          />
        </div>
        <div className="flex gap-4">
          <div>
            <label className="block mb-1">Readability (1-5):</label>
            <select
              value={readability}
              onChange={(e) => setReadability(e.target.value)}
              className="border p-2 rounded"
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
            <label className="block mb-1">Strength (1-9):</label>
            <select
              value={strength}
              onChange={(e) => setStrength(e.target.value)}
              className="border p-2 rounded"
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
        <div className="mb-4">
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700"
          >
            Notes (optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Antenna type, mobile/base, power level, etc."
            rows={3}
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Submit Report
        </button>
      </form>
    </div>
  );
};

export default SignalReportForm;
