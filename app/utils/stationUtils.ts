import { SignalReport } from "../types";

export const findStationsWhoCanHear = (
  callsign: string,
  reports: SignalReport[]
) => {
  return reports
    .filter((report) => report.heard_callsign === callsign)
    .map((report) => report.reporting_callsign);
};

export const findStationsHeardBy = (
  callsign: string,
  reports: SignalReport[]
) => {
  return reports
    .filter((report) => report.reporting_callsign === callsign)
    .map((report) => report.heard_callsign);
};
