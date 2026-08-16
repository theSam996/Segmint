/**
 * Segmint — Model Comparison Page
 * Head-to-head comparison of K-Means vs DBSCAN clustering on the same scaled RFM feature space.
 */

import { useState, useEffect } from 'react';
import { getModelComparison } from '../api/client';
import { formatCurrency, formatNumber, formatPercent, formatDays } from '../utils/formatters';

export default function ModelComparisonPage() {
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getModelComparison()
      .then((res) => setComparison(res.data))
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load model comparison.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="main-content">
        <div className="page-header">
          <h2>Model Comparison</h2>
          <p>Loading algorithmic comparison...</p>
        </div>
        <div className="flex-center" style={{ minHeight: '400px' }}>
          <div className="spinner spinner-lg"></div>
        </div>
      </div>
    );
  }

  if (error || !comparison) {
    return (
      <div className="main-content">
        <div className="page-header">
          <h2>Model Comparison</h2>
          <p>K-Means vs DBSCAN</p>
        </div>
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">⚖️</div>
            <h3>Comparison Data Unavailable</h3>
            <p>{error || 'Please run the pipeline first to generate clustering results.'}</p>
          </div>
        </div>
      </div>
    );
  }

  const { kmeans, dbscan, contingency_matrix, noise_analysis, recommendation } = comparison;

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h2>Unsupervised Model Comparison: K-Means vs. DBSCAN</h2>
          <p>Evaluating spherical partition vs. density-based clustering on the identical scaled 3D RFM matrix.</p>
        </div>
      </div>

      {/* Comparison KPI Grid */}
      <div className="metrics-grid animate-in">
        <div className="card metric-card">
          <div className="metric-card-label">K-Means Clusters (k)</div>
          <div className="metric-card-value" style={{ color: 'var(--accent-purple-light)' }}>
            {kmeans.cluster_count}
          </div>
          <div className="metric-card-sub">Optimized via Silhouette & Elbow</div>
        </div>

        <div className="card metric-card">
          <div className="metric-card-label">K-Means Silhouette Score</div>
          <div className="metric-card-value" style={{ color: 'var(--accent-blue-light)' }}>
            {kmeans.silhouette_score?.toFixed(4) || '—'}
          </div>
          <div className="metric-card-sub">High cohesion & separation</div>
        </div>

        <div className="card metric-card">
          <div className="metric-card-label">DBSCAN Dense Clusters</div>
          <div className="metric-card-value" style={{ color: 'var(--accent-cyan)' }}>
            {dbscan.cluster_count}
          </div>
          <div className="metric-card-sub">eps = {dbscan.parameters.eps}, min_samples = {dbscan.parameters.min_samples}</div>
        </div>

        <div className="card metric-card">
          <div className="metric-card-label">DBSCAN Noise / Outliers</div>
          <div className="metric-card-value" style={{ color: 'var(--accent-amber-light)' }}>
            {formatNumber(dbscan.noise_count)} ({formatPercent(dbscan.noise_percentage)})
          </div>
          <div className="metric-card-sub">Sparse density anomaly points</div>
        </div>
      </div>

      {/* Algorithmic Profiles: Side by Side */}
      <div className="charts-grid animate-in mb-6">
        {/* K-Means Card */}
        <div className="card playbook-card">
          <div className="flex-between">
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--accent-purple-light)' }}>
              📍 K-Means Clustering
            </h3>
            <span className="persona-tag" style={{ background: 'rgba(124, 58, 237, 0.15)', color: 'var(--accent-purple-light)' }}>
              100% Coverage
            </span>
          </div>

          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Partitions the scaled RFM space into <em>k</em> Voronoi cells by iteratively minimizing within-cluster sum of squares (WCSS).
          </p>

          <div>
            <h4 style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--accent-emerald-light)', fontWeight: 700, marginBottom: '6px' }}>
              ✓ Core Strengths
            </h4>
            <ul style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', paddingLeft: '18px', lineHeight: 1.6 }}>
              {kmeans.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--accent-amber-light)', fontWeight: 700, marginBottom: '6px' }}>
              ⚠ Limitations
            </h4>
            <ul style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', paddingLeft: '18px', lineHeight: 1.6 }}>
              {kmeans.weaknesses.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* DBSCAN Card */}
        <div className="card playbook-card">
          <div className="flex-between">
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--accent-cyan)' }}>
              🔬 DBSCAN (Density-Based)
            </h3>
            <span className="persona-tag" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)' }}>
              Outlier Aware
            </span>
          </div>

          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Groups points that are closely packed together (core density regions) and explicitly designates points in low-density regions as noise (-1).
          </p>

          <div>
            <h4 style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--accent-emerald-light)', fontWeight: 700, marginBottom: '6px' }}>
              ✓ Core Strengths
            </h4>
            <ul style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', paddingLeft: '18px', lineHeight: 1.6 }}>
              {dbscan.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--accent-amber-light)', fontWeight: 700, marginBottom: '6px' }}>
              ⚠ Limitations
            </h4>
            <ul style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', paddingLeft: '18px', lineHeight: 1.6 }}>
              {dbscan.weaknesses.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Noise Analysis & Outlier Deep-Dive */}
      <div className="card mb-6 animate-in">
        <div className="card-header">
          <h3>DBSCAN Noise Point & Outlier Deep-Dive</h3>
          <span className="persona-tag" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber-light)' }}>
            {noise_analysis.total_noise_customers} Outlier Customers
          </span>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            <div className="customer-rfm-metric">
              <div className="rfm-label">Noise Avg Spend</div>
              <div className="rfm-value" style={{ color: 'var(--accent-emerald-light)' }}>
                {formatCurrency(noise_analysis.avg_monetary)}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>High variance whale purchases</div>
            </div>

            <div className="customer-rfm-metric">
              <div className="rfm-label">Noise Avg Frequency</div>
              <div className="rfm-value" style={{ color: 'var(--accent-blue-light)' }}>
                {noise_analysis.avg_frequency} orders
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Irregular order cadences</div>
            </div>

            <div className="customer-rfm-metric">
              <div className="rfm-label">Noise Avg Recency</div>
              <div className="rfm-value" style={{ color: 'var(--accent-amber-light)' }}>
                {formatDays(noise_analysis.avg_recency)}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Days since last active</div>
            </div>
          </div>

          <div style={{
            padding: 'var(--space-4)',
            background: 'rgba(0, 0, 0, 0.25)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
          }}>
            <h4 style={{ fontSize: 'var(--text-xs)', color: 'var(--accent-purple-light)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
              Analytical Takeaway:
            </h4>
            <ul style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', paddingLeft: '18px', lineHeight: 1.6 }}>
              {noise_analysis.key_findings.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Cross-Tabulation Matrix */}
      <div className="card mb-6 animate-in">
        <div className="card-header">
          <h3>Algorithm Overlap Matrix (K-Means vs. DBSCAN Contingency)</h3>
        </div>
        <div className="card-body" style={{ overflowX: 'auto', padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>K-Means Segment</th>
                <th>DBSCAN Cluster ID</th>
                <th>Overlap Count</th>
                <th>Distribution Share</th>
              </tr>
            </thead>
            <tbody>
              {contingency_matrix.slice(0, 12).map((cell, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {cell.persona} (Cluster {cell.kmeans_cluster})
                  </td>
                  <td>
                    <span className="persona-tag" style={cell.dbscan_cluster === -1 ? { background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-rose-light)' } : {}}>
                      {cell.dbscan_cluster === -1 ? '⚠ Noise (-1)' : `DBSCAN Cluster ${cell.dbscan_cluster}`}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {formatNumber(cell.count)}
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {formatPercent((cell.count / comparison.noise_analysis.total_noise_customers) * 100)} of cluster
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Strategic Recommendation */}
      <div className="card animate-in" style={{ background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(59, 130, 246, 0.08) 100%)', borderColor: 'var(--accent-purple)' }}>
        <div className="card-body">
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--accent-purple-light)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
            🎯 Executive Synthesis & Recommendation
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', lineHeight: 1.6 }}>
            {recommendation}
          </p>
        </div>
      </div>
    </div>
  );
}
