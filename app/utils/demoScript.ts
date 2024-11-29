import { OperatorInfo, SignalReport } from "../types";

export const runDemo = async (
  setOperatorInfo: (info: OperatorInfo) => void,
  clearOperatorInfo: () => void,
  setOperatorLocations: (
    locations:
      | { callsign: string; coordinates: { lat: number; lng: number } }[]
      | ((
          prev: {
            callsign: string;
            coordinates: { lat: number; lng: number };
          }[]
        ) => { callsign: string; coordinates: { lat: number; lng: number } }[])
  ) => void,
  setReports: (
    reports: SignalReport[] | ((prev: SignalReport[]) => SignalReport[])
  ) => void,
  setSelectedStation: (station: string | null) => void,
  setShowingHeardBy: (showing: boolean) => void
) => {
  // Clear any existing data
  clearOperatorInfo();
  setOperatorLocations([]);
  setReports([]);

  // Set up demo operator immediately
  const portlandOperator: OperatorInfo = {
    callsign: "W7PDX",
    address: "Portland, OR",
    coordinates: { lat: 45.5155, lng: -122.6789 },
  };
  setOperatorInfo(portlandOperator);

  // Select W7PDX initially and set to show who can hear it
  setSelectedStation("W7PDX");
  setShowingHeardBy(true);

  // Simulate other stations checking in
  const demoStations = [
    {
      callsign: "K7SEA",
      coordinates: { lat: 47.6062, lng: -122.3321 },
      address: "Seattle, WA",
    },
    {
      callsign: "K7BOI",
      coordinates: { lat: 43.615, lng: -116.2023 },
      address: "Boise, ID",
    },
    {
      callsign: "K7EUG",
      coordinates: { lat: 44.0521, lng: -123.0868 },
      address: "Eugene, OR",
    },
  ];

  // Add stations one by one
  demoStations.forEach((station, index) => {
    setTimeout(() => {
      // Add station location
      setOperatorLocations(
        (
          prev: {
            callsign: string;
            coordinates: { lat: number; lng: number };
          }[]
        ) => [
          ...prev,
          {
            callsign: station.callsign,
            coordinates: station.coordinates,
          },
        ]
      );

      // Add signal reports
      setReports((prev: SignalReport[]) => [
        ...prev,
        {
          reporting_callsign: "W7PDX",
          heard_callsign: station.callsign,
          readability: 5,
          strength: 9,
          created_at: new Date().toISOString(),
        } as SignalReport,
      ]);
    }, 3000 + index * 3000); // Add a station every 3 seconds
  });

  // Clean up demo data after 30 seconds
  setTimeout(() => {
    clearOperatorInfo();
    setOperatorLocations([]);
    setReports([]);
  }, 30000);
};
