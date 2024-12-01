import { OperatorInfo, SignalReport } from "../types";

// Add helper function for speech synthesis
const speak = async (text: string, voiceIndex: number = 0) => {

  return new Promise<void>((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices().filter(voice => voice.lang === 'en-US');
    // Use different voices for different operators, cycling through available voices
    utterance.voice = voices[voiceIndex % voices.length];
    utterance.rate = 0.9; // Slightly slower for radio effect
    utterance.pitch = 1;
    utterance.onend = () => resolve();
    console.log("Speaking:", text);
    window.speechSynthesis.speak(utterance);
  });
};

const speakCallsign = (callsign: string) => {
  return `${callsign.split("").join(" ")}`;
};

const callsignVoiceNumber = (callsign: string) => {
  switch (callsign) {
    case "W7PDX":
      return 1;
    case "K7SEA":
      return 9;
    case "K7BOI":
      return 10;
    case "K7EUG":
      return 11;
    default:
      return 18;
  }
};
const netControlVoiceNumber = 1;

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
  // Ensure voices are loaded
  if (window.speechSynthesis.getVoices().length === 0) {
    await new Promise<void>((resolve) => {
      window.speechSynthesis.onvoiceschanged = () => resolve();
    });
  }

  // Clear any existing speech
  window.speechSynthesis.cancel();

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

  // 1, 9, 10, 11, 13, 18
  await speak(
    `Welcome to the Simplex Map Demo.
     I am W7PDX and I will be acting as net control.
      Stations will check in one by one.
     Other stations will record how well they copied via the readability and strength form.
     The map will update in realtime for all participants giving us a live map of the network.
     You can click around on any station to view who they can hear, as well as who can hear them.`,
    1
  );
  await speak(`Let's get started.`, 1);

  // Simulate other stations checking in
  const demoStations = [
    {
      callsign: "K7SEA",
      coordinates: { lat: 47.6062, lng: -122.3321 },
      address: "Seattle, Washington",
    },
    {
      callsign: "K7BOI",
      coordinates: { lat: 43.615, lng: -116.2023 },
      address: "Boise, Idaho",
    },
    {
      callsign: "K7EUG",
      coordinates: { lat: 44.0521, lng: -123.0868 },
      address: "Eugene, Oregon",
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

  // Add stations one by one with realistic signal reports and voice synthesis
  for (let i = 0; i < demoStations.length; i++) {
    const station = demoStations[i];

    await speak(
      `${station.callsign.split("").join(" ")} are you there?`,
      netControlVoiceNumber
    );

    // Wait for previous speech to finish
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Station checking in
    await speak(
      `${station.callsign.split("").join(" ")} checking in from ${
        station.address
      }`,
      callsignVoiceNumber(station.callsign)
    );

    await speak(
      `${speakCallsign(station.callsign)} you are checked into the net.`,
      netControlVoiceNumber
    );

    // Add station location
    setOperatorLocations((prev) => [
      ...prev,
      {
        callsign: station.callsign,
        coordinates: station.coordinates,
      },
    ]);

    // Add signal reports with voice synthesis
    setReports((prev: SignalReport[]) => {
      const newReports: SignalReport[] = [...prev];

      // Reports from/to Portland (W7PDX)
      if (station.callsign === "K7SEA") {
        const report = createSignalReport("W7PDX", "K7SEA", "medium");
        newReports.push(report);
      } else if (station.callsign === "K7EUG") {
        const report1 = createSignalReport("W7PDX", "K7EUG", "good");
        const report2 = createSignalReport("K7EUG", "W7PDX", "good");
        newReports.push(report1, report2);
      } else if (station.callsign === "K7BOI") {
        const report1 = createSignalReport("W7PDX", "K7BOI", "poor");
        const report2 = createSignalReport("K7BOI", "W7PDX", "poor");
        newReports.push(report1, report2);
      }

      // Add reports between other stations with voice synthesis
      const existingStations = prev
        .map((report) => report.reporting_callsign)
        .filter((callsign) => callsign !== "W7PDX");

      existingStations.forEach((existingStation) => {
        if (existingStation === "K7SEA" && station.callsign === "K7BOI") {
          const report1 = createSignalReport("K7SEA", "K7BOI", "poor");
          const report2 = createSignalReport("K7BOI", "K7SEA", "poor");
          newReports.push(report1, report2);
        } else if (
          existingStation === "K7EUG" &&
          station.callsign === "K7BOI"
        ) {
          const report1 = createSignalReport("K7EUG", "K7BOI", "medium");
          const report2 = createSignalReport("K7BOI", "K7EUG", "medium");
          newReports.push(report1, report2);
        } else if (
          existingStation === "K7SEA" &&
          station.callsign === "K7EUG"
        ) {
          const report1 = createSignalReport("K7SEA", "K7EUG", "medium");
          const report2 = createSignalReport("K7EUG", "K7SEA", "medium");
          newReports.push(report1, report2);
        }
      });

      return newReports;
    });

    // Wait before next station
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  await speak(
    `All stations are checked in. This concludes the demo. Feel free to explore the map further. 
    Notice that clicking on a station will show you who can hear it. Click again to see who it can hear, as they may be different depending on terrain, antennas, and other factors.
    If you are organizing a simplex check-in, you can start a new check-in session above. If you are joining a check-in session, please find your session above and click to join. Thanks for using Simplex Map!`,
    netControlVoiceNumber
  );
};
