import React, { useState } from "react";

type Coordinates = {
  lat: number;
  lng: number;
};

type OperatorInfo = {
  callsign: string;
  address: string;
  coordinates: Coordinates;
};

interface OperatorSetupFormProps {
  onComplete: (info: OperatorInfo) => void;
}

const OperatorSetupForm: React.FC<OperatorSetupFormProps> = ({
  onComplete,
}) => {
  const [callsign, setCallsign] = useState("");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Geocode the address using Google Maps Geocoding API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );

      const data = await response.json();

      if (data.status !== "OK") {
        throw new Error("Could not find coordinates for this address");
      }

      const { lat, lng } = data.results[0].geometry.location;

      const operatorInfo: OperatorInfo = {
        callsign: callsign.toUpperCase(),
        address,
        coordinates: { lat, lng },
      };

      // Store in localStorage
      localStorage.setItem("operatorInfo", JSON.stringify(operatorInfo));

      onComplete(operatorInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Operator Setup</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Your Callsign:</label>
          <input
            type="text"
            value={callsign}
            onChange={(e) => setCallsign(e.target.value.toUpperCase())}
            className="border p-2 w-full rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Operating Address:</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="border p-2 w-full rounded"
            placeholder="Enter your full address"
            required
          />
        </div>

        {error && <p className="text-red-500">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Continue"}
        </button>
      </form>
    </div>
  );
};

export default OperatorSetupForm;
