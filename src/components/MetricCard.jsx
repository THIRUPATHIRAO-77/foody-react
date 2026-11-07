export default function MetricCard({ label, value, hot = false }) {
  return (
    <div className={`metric${hot ? " hot" : ""}`}>
      <span className="metric-label">{label}</span>
      <span className="metric-value">{value}</span>
    </div>
  );
}
