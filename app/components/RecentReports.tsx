import { SignalReport } from "../types";

interface RecentReportsProps {
  reports: SignalReport[];
}

const RecentReports: React.FC<RecentReportsProps> = ({ reports }) => {
  return (
    <div className="bg-white rounded shadow p-4">
      <h2 className="text-xl mb-4">Recent Reports</h2>
      <div className="space-y-2">
        {reports
          .slice(-5)
          .reverse()
          .map((report, index) => (
            <div key={index} className="border-b pb-2">
              <p className="font-bold">
                {report.reporting_callsign} → {report.heard_callsign}
              </p>
              <p className="text-sm text-gray-600">
                Signal: {report.readability} by {report.strength}
                <br />
                {new Date(report.created_at).toLocaleString()}
                {report.notes && (
                  <>
                    <br />
                    <span className="italic">{report.notes}</span>
                  </>
                )}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default RecentReports;
