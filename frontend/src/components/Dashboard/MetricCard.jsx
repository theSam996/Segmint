/**
 * Segmint — Metric Card Component
 */

export default function MetricCard({ label, value, sub, color, icon }) {
  return (
    <div className="card metric-card">
      <div className="metric-card-label">
        {icon && <span style={{ marginRight: '6px' }}>{icon}</span>}
        {label}
      </div>
      <div
        className="metric-card-value gradient"
        style={color ? {
          background: color,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        } : undefined}
      >
        {value}
      </div>
      {sub && <div className="metric-card-sub">{sub}</div>}
    </div>
  );
}
