/**
 * Segmint — RFM Distribution Charts
 */

import { useMemo } from 'react';
import Plot from 'react-plotly.js';

const CLUSTER_COLORS = [
  '#7c3aed', '#3b82f6', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#06b6d4', '#8b5cf6',
];

export default function RFMDistribution({ data, metric = 'monetary' }) {
  const traces = useMemo(() => {
    if (!data?.distributions?.length) return [];

    return data.distributions.map((d, idx) => ({
      x: d.values,
      type: 'histogram',
      name: d.persona || `Cluster ${d.cluster_id}`,
      opacity: 0.65,
      marker: {
        color: CLUSTER_COLORS[idx % CLUSTER_COLORS.length],
      },
      nbinsx: 30,
    }));
  }, [data]);

  const title = {
    recency: 'Recency Distribution (days)',
    frequency: 'Frequency Distribution (orders)',
    monetary: 'Monetary Distribution (£)',
  }[metric] || metric;

  if (!data?.distributions?.length) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📊</div>
        <h3>No Distribution Data</h3>
        <p>Run the pipeline first.</p>
      </div>
    );
  }

  return (
    <Plot
      data={traces}
      layout={{
        template: 'plotly_dark',
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { family: 'Inter, sans-serif', color: '#8888a0' },
        margin: { l: 50, r: 20, t: 10, b: 40 },
        barmode: 'overlay',
        xaxis: {
          title: title,
          gridcolor: 'rgba(255,255,255,0.04)',
          titlefont: { size: 11 },
        },
        yaxis: {
          title: 'Count',
          gridcolor: 'rgba(255,255,255,0.04)',
          titlefont: { size: 11 },
        },
        legend: {
          orientation: 'h',
          yanchor: 'bottom',
          y: 1.02,
          xanchor: 'center',
          x: 0.5,
          font: { size: 10 },
        },
        hoverlabel: {
          bgcolor: '#1a1a2e',
          font: { family: 'Inter', size: 11, color: '#f0f0f5' },
        },
      }}
      config={{ displayModeBar: false, responsive: true }}
      style={{ width: '100%', height: '280px' }}
      useResizeHandler
    />
  );
}
