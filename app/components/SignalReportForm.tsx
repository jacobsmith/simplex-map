import React, { useState, useEffect } from "react";

type SignalReport = {
  timestamp: number;
  heardCallsign: string;
  reportingCallsign: string;
  readability: number;
  strength: number;
};

interface SignalReportFormProps {
  onSubmit: () => void;
}

const SignalReportForm: React.FC<SignalReportFormProps> = ({ onSubmit }) => {
  const [heardCallsign, setHeardCallsign] = useState("");
  const [readability, setReadability] = useState("5");
  const [strength, setStrength] = useState("9");
  const [operatorInfo, setOperatorInfo] = useState<any>(null);

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
