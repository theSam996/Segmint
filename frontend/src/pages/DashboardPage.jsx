/**
 * Segmint — Executive Dashboard Page
 * High-level overview of customer segments with PCA scatter plot, metrics, segment breakdown, and quick navigation.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MetricCard from '../components/Dashboard/MetricCard';
import ClusterChart from '../components/Dashboard/ClusterChart';
import ClusterSummaryTable from '../components/Dashboard/ClusterSummaryTable';
import RFMDistribution from '../components/Dashboard/RFMDistribution';
import { getClusterSummary, getPCAData, getDistribution } from '../api/client';
import { formatNumber, formatCurrency, formatDays } from '../utils/formatters';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [pcaData, setPcaData] = useState(null);
  const [distData, setDistData] = useState(null);
  const [algorithm, setAlgorithm] = useState('kmeans');
  const [distMetric, setDistMetric] = useState('monetary');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadDistribution(distMetric);
  }, [distMetric]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumRes, pcaRes, distRes] = await Promise.all([
        getClusterSummary(),
        getPCAData(),
        getDistribution(distMetric),
      ]);
      setSummary(sumRes.data);
      setPcaData(pcaRes.data);
      setDistData(distRes.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load dashboard data. Run the pipeline first.');
    } finally {
      setLoading(false);
    }
  };

  const loadDistribution = async (metric) => {
    try {
      const res = await getDistribution(metric);
      setDistData(res.data);
    } catch {
      // silent
    }
  };

  const totalCustomers = summary?.total_customers || 0;
  const clusterCount = summary?.clusters?.length || 0;
  const avgMonetary = summary?.clusters?.length
    ? summary.clusters.reduce((sum, c) => sum + c.avg_monetary * c.customer_count, 0) / totalCustomers
    : 0;
  const avgRecency = summary?.clusters?.length
    ? summary.clusters.reduce((sum, c) => sum + c.avg_recency * c.customer_count, 0) / totalCustomers
    : 0;

  if (loading) {
    return (
      <div className="main-content">
        <div className="page-header">
          <h2>Dashboard</h2>
          <p>Loading intelligence data...</p>
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
          <h2>Dashboard</h2>
          <p>Cluster overview & segment intelligence</p>
        </div>
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🔬</div>
            <h3>No Active Data Ingested</h3>
            <p>{error || 'Please run the pipeline or upload your dataset to view the dashboard.'}</p>
            <button className="btn btn-primary mt-4" onClick={() => navigate('/setup')}>
              Go to Setup & Upload →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>Executive Intelligence Dashboard</h2>
          <p>Unsupervised customer segmentation overview powered by RFM behavioral modeling.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/setup')}>
            ⚙️ Setup & Ingestion
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/segments')}>
            🎯 View Segment Playbooks →
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid animate-in">
        <MetricCard
          icon="👥"
          label="Segmented Customers"
          value={formatNumber(totalCustomers)}
          sub="100% database coverage"
        />
        <MetricCard
          icon="🎯"
          label="Active Personas"
          value={clusterCount}
          sub="K-Means optimal clusters"
          color="linear-gradient(135deg, #7c3aed, #3b82f6)"
        />
        <MetricCard
          icon="💰"
          label="Average Spend"
          value={formatCurrency(avgMonetary)}
          sub="Per customer lifetime"
          color="linear-gradient(135deg, #10b981, #06b6d4)"
        />
        <MetricCard
          icon="📅"
          label="Average Recency"
          value={formatDays(avgRecency)}
          sub="Since last purchase"
          color="linear-gradient(135deg, #f59e0b, #ef4444)"
        />
      </div>

      {/* Quick Nav Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--space-3)',
        marginBottom: 'var(--space-6)',
      }}>
        <div
          className="card"
          style={{ padding: 'var(--space-4)', cursor: 'pointer', borderColor: 'rgba(124, 58, 237, 0.3)' }}
          onClick={() => navigate('/segments')}
        >
          <div style={{ fontSize: '1.25rem', marginBottom: '4px' }}>🎯</div>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>Segments & Playbooks</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Action playbooks per persona →</div>
        </div>

        <div
          className="card"
          style={{ padding: 'var(--space-4)', cursor: 'pointer', borderColor: 'rgba(59, 130, 246, 0.3)' }}
          onClick={() => navigate('/customers')}
        >
          <div style={{ fontSize: '1.25rem', marginBottom: '4px' }}>👥</div>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>Customer Search</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Lookup & inspect {formatNumber(totalCustomers)} accounts →</div>
        </div>

        <div
          className="card"
          style={{ padding: 'var(--space-4)', cursor: 'pointer', borderColor: 'rgba(16, 185, 129, 0.3)' }}
          onClick={() => navigate('/analytics')}
        >
          <div style={{ fontSize: '1.25rem', marginBottom: '4px' }}>📈</div>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>Deep Analytics</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Revenue disparity & RFM curves →</div>
        </div>

        <div
          className="card"
          style={{ padding: 'var(--space-4)', cursor: 'pointer', borderColor: 'rgba(245, 158, 11, 0.3)' }}
          onClick={() => navigate('/comparison')}
        >
          <div style={{ fontSize: '1.25rem', marginBottom: '4px' }}>⚖️</div>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>Model Comparison</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>K-Means vs DBSCAN noise check →</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid animate-in">
        {/* PCA Scatter Plot */}
        <div className="card full-width">
          <div className="card-header">
            <div>
              <h3>Customer Segments — 2D PCA Space Projection</h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
                93.7% variance preserved from 3D scaled RFM feature space. Hover over points for customer IDs.
              </p>
            </div>
            <div className="select-wrapper">
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
              >
                <option value="kmeans">Algorithm: K-Means (Spherical)</option>
                <option value="dbscan">Algorithm: DBSCAN (Density + Noise)</option>
              </select>
            </div>
          </div>
          <div className="card-body">
            <ClusterChart data={pcaData} algorithm={algorithm} />
          </div>
        </div>

        {/* RFM Distribution */}
        <div className="card">
          <div className="card-header">
            <h3>RFM Metric Density</h3>
            <div className="select-wrapper">
              <select
                value={distMetric}
                onChange={(e) => setDistMetric(e.target.value)}
              >
                <option value="monetary">Monetary (£)</option>
                <option value="frequency">Frequency (Orders)</option>
                <option value="recency">Recency (Days)</option>
              </select>
            </div>
          </div>
          <div className="card-body">
            <RFMDistribution data={distData} metric={distMetric} />
          </div>
        </div>

        {/* Cluster Breakdown */}
        <div className="card">
          <div className="card-header">
            <h3>Persona Cohort Breakdown</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/segments')}>
              Details →
            </button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {summary?.clusters?.map((c) => (
              <div
                key={c.cluster_id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 20px',
                  borderBottom: '1px solid var(--border-color)',
                  cursor: 'pointer',
                }}
                onClick={() => navigate('/segments')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.3rem' }}>{c.icon}</span>
                  <div>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: c.color }}>
                      {c.persona}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      {formatNumber(c.customer_count)} accounts · avg spend {formatCurrency(c.avg_monetary)}
                    </div>
                  </div>
                </div>
                <div style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                }}>
                  {c.pct_of_base.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cluster Summary Table */}
      <div className="card animate-in">
        <div className="card-header">
          <h3>Segment Details & Recommended Action Strategies</h3>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/segments')}>
            Full Playbooks →
          </button>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <ClusterSummaryTable clusters={summary?.clusters} />
        </div>
      </div>
    </div>
  );
}
