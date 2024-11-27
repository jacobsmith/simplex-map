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
  created_at: string;
  session_id?: string;
  notes?: string;
};

export type OperatorInfo = {
  callsign: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
};

export interface CheckinSession {
  id: string;
  name: string;
  description?: string;
  region: string;
  start_time: string;
  end_time?: string;
  created_by: string;
  is_active: boolean;
  created_at: string;
}

export interface SessionParticipant {
  id: string;
  session_id: string;
  callsign: string;
  latitude: number;
  longitude: number;
  joined_at: string;
  left_at?: string;
  created_at: string;
}
