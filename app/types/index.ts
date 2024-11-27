export type User = {
  lat: number;
  lng: number;
  callsign: string;
};

export type SignalReport = {
  id: string;
  reporting_callsign: string;
  heard_callsign: string;
  readability: number;
  strength: number;
  notes?: string;
  created_at: string;
};

export type OperatorInfo = {
  callsign: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
};
