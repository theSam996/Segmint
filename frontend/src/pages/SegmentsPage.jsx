/**
 * Segmint — Segments & Action Recommendations Page
 * In-depth business persona profiles, RFM characteristics, and actionable retention playbooks.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClusterSummary } from '../api/client';
import { formatCurrency, formatNumber, formatDays, formatPercent } from '../utils/formatters';

export default function SegmentsPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    getClusterSummary()
      .then((res) => setSummary(res.data))
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load segment summaries.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="main-content">
        <div className="page-header">
          <h2>Customer Segments</h2>
          <p>Loading persona profiles...</p>
        </div>
        <div className="flex-center" style={{ minHeight: '400px' }}>
          <div className="spinner spinner-lg"></div>
        </div>
      </div>
    );
  }

  if (error || !summary?.clusters?.length) {
    return (
      <div className="main-content">
        <div className="page-header">
          <h2>Customer Segments</h2>
          <p>Business personas & tactical playbooks</p>
        </div>
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🎯</div>
            <h3>No Segment Data Available</h3>
            <p>{error || 'Please run the pipeline first to generate customer segments.'}</p>
            <button className="btn btn-primary mt-4" onClick={() => navigate('/setup')}>
              Go to Setup & Pipeline →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const clusters = summary.clusters;
  const filteredClusters = activeTab === 'all'
    ? clusters
    : clusters.filter(c => c.cluster_id.toString() === activeTab);

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h2>Customer Segments & Action Playbooks</h2>
          <p>Translating unsupervised ML clusters into human-readable personas with targeted business playbooks.</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/customers')}>
          👥 Search Individual Customers →
        </button>
      </div>

      {/* Segment Filter Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        <button
          className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('all')}
        >
          All Segments ({clusters.length})
        </button>
        {clusters.map((c) => (
          <button
            key={c.cluster_id}
            className={`btn ${activeTab === c.cluster_id.toString() ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveTab(c.cluster_id.toString())}
            style={activeTab === c.cluster_id.toString() ? { background: c.color, borderColor: c.color } : {}}
          >
            <span>{c.icon}</span> {c.persona} ({formatPercent(c.pct_of_base)})
          </button>
        ))}
      </div>

      {/* Segment Persona Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: 'var(--space-6)',
        marginBottom: 'var(--space-8)',
      }}>
        {filteredClusters.map((c) => (
          <div key={c.cluster_id} className="card playbook-card">
            {/* Header */}
            <div className="flex-between">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <span style={{ fontSize: '2rem' }}>{c.icon}</span>
                <div>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: c.color }}>
                    {c.persona}
                  </h3>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    Cluster #{c.cluster_id} · {formatNumber(c.customer_count)} Customers ({formatPercent(c.pct_of_base)})
                  </span>
                </div>
              </div>
              <span
                className="persona-tag"
                style={{
                  background: `${c.color}15`,
                  color: c.color,
                  borderColor: `${c.color}35`,
                }}
              >
                {c.r_level === 'low' ? 'Recent' : c.r_level === 'high' ? 'Dormant' : 'Moderate'} Activity
              </span>
            </div>

            {/* Description */}
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {c.description}
            </p>

            {/* RFM Averages Mini Grid */}
            <div className="customer-detail-grid">
              <div className="customer-rfm-metric">
                <div className="rfm-label">Avg Recency</div>
                <div className="rfm-value" style={{ color: 'var(--accent-amber-light)' }}>
                  {formatDays(c.avg_recency)}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {c.r_level} recency
                </div>
              </div>

              <div className="customer-rfm-metric">
                <div className="rfm-label">Avg Frequency</div>
                <div className="rfm-value" style={{ color: 'var(--accent-blue-light)' }}>
                  {formatNumber(c.avg_frequency, 1)}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {c.f_level} orders
                </div>
              </div>

              <div className="customer-rfm-metric">
                <div className="rfm-label">Avg Spend</div>
                <div className="rfm-value" style={{ color: 'var(--accent-emerald-light)' }}>
                  {formatCurrency(c.avg_monetary)}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {c.m_level} spend
                </div>
              </div>
            </div>

            {/* Tactical Business Playbook */}
            <div style={{
              padding: 'var(--space-4)',
              background: 'rgba(124, 58, 237, 0.06)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(124, 58, 237, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
            }}>
              <div style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                color: 'var(--accent-purple-light)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                💡 Recommended Business Action Playbook
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                {c.action}
              </div>
            </div>

            <button
              className="btn btn-secondary btn-sm"
              style={{ alignSelf: 'flex-start' }}
              onClick={() => navigate(`/customers?persona=${encodeURIComponent(c.persona)}`)}
            >
              Filter Customers in this Segment ({formatNumber(c.customer_count)}) →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
