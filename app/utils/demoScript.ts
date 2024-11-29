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

  // Create signal reports between stations based on distance
  const createSignalReport = (
    from: string,
    to: string,
    quality: "good" | "medium" | "poor"
  ): SignalReport => {
    const reports = {
      good: { readability: 5, strength: 9 },
      medium: { readability: 4, strength: 5 },
      poor: { readability: 2, strength: 3 },
    };

    return {
      reporting_callsign: from,
      heard_callsign: to,
      readability: reports[quality].readability,
      strength: reports[quality].strength,
      created_at: new Date().toISOString(),
    } as SignalReport;
  };

  // Add stations one by one with realistic signal reports
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

      // Add signal reports based on geographic proximity
      setReports((prev: SignalReport[]) => {
        const newReports: SignalReport[] = [...prev];

        // Reports from/to Portland (W7PDX)
        if (station.callsign === "K7SEA") {
          // Seattle-Portland: Medium quality both ways
          setTimeout(() => {
            newReports.push(createSignalReport("W7PDX", "K7SEA", "medium"));
          }, 1000); // Delay of 1 second
        } else if (station.callsign === "K7EUG") {
          // Eugene-Portland: Good quality both ways
          setTimeout(() => {
            newReports.push(createSignalReport("W7PDX", "K7EUG", "good"));
            newReports.push(createSignalReport("K7EUG", "W7PDX", "good"));
          }, 1000); // Delay of 1 second
        } else if (station.callsign === "K7BOI") {
          // Boise-Portland: Poor quality both ways
          setTimeout(() => {
            newReports.push(createSignalReport("W7PDX", "K7BOI", "poor"));
            newReports.push(createSignalReport("K7BOI", "W7PDX", "poor"));
          }, 1000); // Delay of 1 second
        }

        // Add reports between other stations
        const existingStations = prev
          .map((report) => report.reporting_callsign)
          .filter((callsign) => callsign !== "W7PDX");

        existingStations.forEach((existingStation) => {
          if (existingStation === "K7SEA" && station.callsign === "K7BOI") {
            // Seattle-Boise: Poor quality
            setTimeout(() => {
              newReports.push(createSignalReport("K7SEA", "K7BOI", "poor"));
              newReports.push(createSignalReport("K7BOI", "K7SEA", "poor"));
            }, 2000); // Additional delay of 2 seconds
          } else if (
            existingStation === "K7EUG" &&
            station.callsign === "K7BOI"
          ) {
            // Eugene-Boise: Medium quality
            setTimeout(() => {
              newReports.push(createSignalReport("K7EUG", "K7BOI", "medium"));
              newReports.push(createSignalReport("K7BOI", "K7EUG", "medium"));
            }, 2000); // Additional delay of 2 seconds
          } else if (
            existingStation === "K7SEA" &&
            station.callsign === "K7EUG"
          ) {
            // Seattle-Eugene: Medium quality
            setTimeout(() => {
              newReports.push(createSignalReport("K7SEA", "K7EUG", "medium"));
              newReports.push(createSignalReport("K7EUG", "K7SEA", "medium"));
            }, 2000); // Additional delay of 2 seconds
          }
        });

        return newReports;
      });
    }, 3000 + index * 3000); // Add a station every 3 seconds
  });

  // Clean up demo data after 30 seconds
  setTimeout(() => {
    clearOperatorInfo();
    setOperatorLocations([]);
    setReports([]);
  }, 30000);
};
