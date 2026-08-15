/**
 * Segmint — Cluster Summary Table
 */

import { formatCurrency, formatNumber, formatDays, formatPercent } from '../../utils/formatters';

export default function ClusterSummaryTable({ clusters }) {
  if (!clusters?.length) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📋</div>
        <h3>No Cluster Data</h3>
        <p>Run the pipeline to generate cluster summaries.</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Segment</th>
            <th>Customers</th>
            <th>% Base</th>
            <th>Avg Recency</th>
            <th>Avg Frequency</th>
            <th>Avg Monetary</th>
            <th>Recommended Action</th>
          </tr>
        </thead>
        <tbody>
          {clusters.map((c) => (
            <tr key={c.cluster_id}>
              <td>
                <span
                  className="persona-tag"
                  style={{
                    background: `${c.color}15`,
                    color: c.color,
                    borderColor: `${c.color}30`,
                  }}
                >
                  <span>{c.icon}</span>
                  {c.persona}
                </span>
              </td>
              <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {formatNumber(c.customer_count)}
              </td>
              <td>{formatPercent(c.pct_of_base)}</td>
              <td>{formatDays(c.avg_recency)}</td>
              <td>{formatNumber(c.avg_frequency, 1)}</td>
              <td style={{ color: 'var(--accent-emerald-light)' }}>
                {formatCurrency(c.avg_monetary)}
              </td>
              <td style={{ fontSize: 'var(--text-xs)', maxWidth: '280px' }}>
                {c.action}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
