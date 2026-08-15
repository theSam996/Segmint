/**
 * Segmint — Dashboard Page
 * Overview of customer segments with PCA scatter plot, metrics, and cluster summary.
 */

import { useState, useEffect } from 'react';
import MetricCard from '../components/Dashboard/MetricCard';
import ClusterChart from '../components/Dashboard/ClusterChart';
import ClusterSummaryTable from '../components/Dashboard/ClusterSummaryTable';
import RFMDistribution from '../components/Dashboard/RFMDistribution';
import { getClusterSummary, getPCAData, getDistribution } from '../api/client';
import { formatNumber, formatCurrency, formatDays } from '../utils/formatters';

export default function DashboardPage() {
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

  // Compute metrics from summary
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
          <p>Loading analytics...</p>
        </div>
        <div className="flex-center" style={{ minHeight: '400px' }}>
          <div className="spinner spinner-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content">
        <div className="page-header">
          <h2>Dashboard</h2>
          <p>Cluster overview & segment analysis</p>
        </div>
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🔬</div>
            <h3>No Data Available</h3>
            <p>{error}</p>
            <button className="btn btn-primary mt-4" onClick={() => window.location.href = '/pipeline'}>
              Go to Pipeline →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Customer segmentation overview powered by RFM analysis</p>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid animate-in">
        <MetricCard
          icon="👥"
          label="Total Customers"
          value={formatNumber(totalCustomers)}
          sub="Segmented customers"
        />
        <MetricCard
          icon="🎯"
          label="Segments Found"
          value={clusterCount}
          sub="K-Means clusters"
          color="linear-gradient(135deg, #7c3aed, #3b82f6)"
        />
        <MetricCard
          icon="💰"
          label="Avg Monetary"
          value={formatCurrency(avgMonetary)}
          sub="Per customer"
          color="linear-gradient(135deg, #10b981, #06b6d4)"
        />
        <MetricCard
          icon="📅"
          label="Avg Recency"
          value={formatDays(avgRecency)}
          sub="Since last purchase"
          color="linear-gradient(135deg, #f59e0b, #ef4444)"
        />
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* PCA Scatter Plot */}
        <div className="card full-width">
          <div className="card-header">
            <h3>Customer Segments — PCA Projection</h3>
            <div className="select-wrapper">
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
              >
                <option value="kmeans">K-Means</option>
                <option value="dbscan">DBSCAN</option>
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
            <h3>RFM Distribution</h3>
            <div className="select-wrapper">
              <select
                value={distMetric}
                onChange={(e) => setDistMetric(e.target.value)}
              >
                <option value="monetary">Monetary</option>
                <option value="frequency">Frequency</option>
                <option value="recency">Recency</option>
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
            <h3>Segment Breakdown</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {summary?.clusters?.map((c) => (
              <div
                key={c.cluster_id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 20px',
                  borderBottom: '1px solid var(--border-color)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.2rem' }}>{c.icon}</span>
                  <div>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: c.color }}>
                      {c.persona}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      {formatNumber(c.customer_count)} customers
                    </div>
                  </div>
                </div>
                <div style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 700,
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
      <div className="card">
        <div className="card-header">
          <h3>Segment Details & Recommended Actions</h3>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <ClusterSummaryTable clusters={summary?.clusters} />
        </div>
      </div>
    </div>
  );
}
