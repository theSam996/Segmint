/**
 * Segmint — Deep Analytics Page
 * Revenue contribution, RFM distributions, and behavioral scatter correlations.
 */

import { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { getAnalytics, getDistribution } from '../api/client';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [distData, setDistData] = useState(null);
  const [distMetric, setDistMetric] = useState('monetary');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getAnalytics(), getDistribution(distMetric)])
      .then(([aRes, dRes]) => {
        setAnalytics(aRes.data);
        setDistData(dRes.data);
      })
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load analytics data.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getDistribution(distMetric)
      .then((res) => setDistData(res.data))
      .catch(() => {});
  }, [distMetric]);

  if (loading) {
    return (
      <div className="main-content">
        <div className="page-header">
          <h2>Deep Analytics</h2>
          <p>Loading analytics models...</p>
        </div>
        <div className="flex-center" style={{ minHeight: '400px' }}>
          <div className="spinner spinner-lg"></div>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="main-content">
        <div className="page-header">
          <h2>Deep Analytics</h2>
          <p>Revenue shares & behavioral distributions</p>
        </div>
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📈</div>
            <h3>Analytics Unavailable</h3>
            <p>{error || 'Please run the pipeline first to generate analytics.'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Build Revenue Distribution Donut chart
  const revenueDonutData = [{
    values: analytics.revenue_distribution.map((r) => r.total_revenue),
    labels: analytics.revenue_distribution.map((r) => `${r.persona} (${r.pct_revenue}%)`),
    type: 'pie',
    hole: 0.55,
    marker: {
      colors: analytics.revenue_distribution.map((r) => r.color),
    },
    textinfo: 'label+percent',
    hoverinfo: 'label+value',
  }];

  // Build Customers vs Revenue grouped bar chart
  const comparisonBarData = [
    {
      x: analytics.revenue_distribution.map((r) => r.persona),
      y: analytics.revenue_distribution.map((r) => r.pct_customers),
      name: '% of Customer Base',
      type: 'bar',
      marker: { color: '#3b82f6' },
    },
    {
      x: analytics.revenue_distribution.map((r) => r.persona),
      y: analytics.revenue_distribution.map((r) => r.pct_revenue),
      name: '% of Total Revenue',
      type: 'bar',
      marker: { color: '#10b981' },
    },
  ];

  // RFM Distribution Histogram
  const distTraces = (distData?.distributions || []).map((d, i) => ({
    x: d.values,
    type: 'histogram',
    name: d.persona,
    opacity: 0.65,
    nbinsx: 35,
  }));

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h2>Behavioral & Financial Analytics</h2>
          <p>Revenue contribution disparity, RFM distribution shapes, and correlation diagnostics.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="metrics-grid animate-in">
        <div className="card metric-card">
          <div className="metric-card-label">Total Gross Revenue</div>
          <div className="metric-card-value gradient">
            {formatCurrency(analytics.total_revenue)}
          </div>
          <div className="metric-card-sub">Across {formatNumber(analytics.total_customers)} customers</div>
        </div>

        <div className="card metric-card">
          <div className="metric-card-label">Avg Order Basket</div>
          <div className="metric-card-value" style={{ color: 'var(--accent-emerald-light)' }}>
            {formatCurrency(analytics.average_order_value)}
          </div>
          <div className="metric-card-sub">Revenue per invoice event</div>
        </div>

        <div className="card metric-card">
          <div className="metric-card-label">Frequency-Spend Correlation</div>
          <div className="metric-card-value" style={{ color: 'var(--accent-purple-light)' }}>
            r = {analytics.correlation_frequency_monetary}
          </div>
          <div className="metric-card-sub">Strong positive linear trend</div>
        </div>

        <div className="card metric-card">
          <div className="metric-card-label">Recency-Spend Correlation</div>
          <div className="metric-card-value" style={{ color: 'var(--accent-amber-light)' }}>
            r = {analytics.correlation_recency_monetary}
          </div>
          <div className="metric-card-sub">Negative trend (dormancy decays spend)</div>
        </div>
      </div>

      {/* Charts Row: Revenue Donut & Customer vs Revenue Disparity */}
      <div className="charts-grid animate-in">
        {/* Revenue Share Donut */}
        <div className="card">
          <div className="card-header">
            <h3>Revenue Share by Segment</h3>
          </div>
          <div className="card-body">
            <Plot
              data={revenueDonutData}
              layout={{
                template: 'plotly_dark',
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                font: { family: 'Inter, sans-serif', color: '#8888a0' },
                margin: { l: 20, r: 20, t: 20, b: 20 },
                showlegend: false,
              }}
              config={{ displayModeBar: false, responsive: true }}
              style={{ width: '100%', height: '320px' }}
              useResizeHandler
            />
          </div>
        </div>

        {/* Customer Base vs Revenue Disparity */}
        <div className="card">
          <div className="card-header">
            <h3>Customer Count % vs. Revenue Contribution %</h3>
          </div>
          <div className="card-body">
            <Plot
              data={comparisonBarData}
              layout={{
                template: 'plotly_dark',
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                font: { family: 'Inter, sans-serif', color: '#8888a0' },
                barmode: 'group',
                margin: { l: 40, r: 20, t: 30, b: 40 },
                yaxis: { title: 'Percentage (%)', gridcolor: 'rgba(255,255,255,0.04)' },
                xaxis: { gridcolor: 'rgba(255,255,255,0.04)' },
                legend: { orientation: 'h', y: 1.15 },
              }}
              config={{ displayModeBar: false, responsive: true }}
              style={{ width: '100%', height: '320px' }}
              useResizeHandler
            />
          </div>
        </div>

        {/* Overlaid RFM Distribution Histogram */}
        <div className="card full-width">
          <div className="card-header">
            <h3>RFM Metric Density & Distribution by Segment</h3>
            <div className="select-wrapper">
              <select
                value={distMetric}
                onChange={(e) => setDistMetric(e.target.value)}
              >
                <option value="monetary">Monetary (£ Total Spend)</option>
                <option value="frequency">Frequency (Unique Orders)</option>
                <option value="recency">Recency (Days Since Active)</option>
              </select>
            </div>
          </div>
          <div className="card-body">
            <Plot
              data={distTraces}
              layout={{
                template: 'plotly_dark',
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                font: { family: 'Inter, sans-serif', color: '#8888a0' },
                barmode: 'overlay',
                margin: { l: 50, r: 20, t: 20, b: 50 },
                xaxis: {
                  title: `${distMetric.toUpperCase()} Value`,
                  gridcolor: 'rgba(255,255,255,0.04)',
                },
                yaxis: {
                  title: 'Customer Count',
                  gridcolor: 'rgba(255,255,255,0.04)',
                },
                legend: { orientation: 'h', y: 1.1 },
              }}
              config={{ displayModeBar: true, responsive: true }}
              style={{ width: '100%', height: '360px' }}
              useResizeHandler
            />
          </div>
        </div>
      </div>
    </div>
  );
}
