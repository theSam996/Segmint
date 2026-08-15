/**
 * Segmint — PCA Cluster Scatter Plot (Plotly)
 */

import { useMemo } from 'react';
import Plot from 'react-plotly.js';

const CLUSTER_COLORS = [
  '#7c3aed', '#3b82f6', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#06b6d4', '#8b5cf6',
  '#f97316', '#14b8a6',
];

export default function ClusterChart({ data, algorithm = 'kmeans' }) {
  const traces = useMemo(() => {
    if (!data?.points?.length) return [];

    const clusterKey = algorithm === 'kmeans' ? 'kmeans_cluster' : 'dbscan_cluster';

    // Group points by cluster
    const groups = {};
    data.points.forEach((p) => {
      const cluster = p[clusterKey];
      if (!groups[cluster]) groups[cluster] = { x: [], y: [], ids: [], personas: [] };
      groups[cluster].x.push(p.pc1);
      groups[cluster].y.push(p.pc2);
      groups[cluster].ids.push(p.customer_id);
      groups[cluster].personas.push(p.persona || `Cluster ${cluster}`);
    });

    return Object.entries(groups)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([clusterId, pts], idx) => {
        const isNoise = clusterId === '-1';
        const persona = pts.personas[0] || `Cluster ${clusterId}`;

        return {
          x: pts.x,
          y: pts.y,
          mode: 'markers',
          type: 'scattergl',
          name: isNoise ? 'Noise' : persona,
          text: pts.ids.map((id, i) =>
            `Customer: ${id}<br>Segment: ${pts.personas[i]}`
          ),
          hovertemplate: '%{text}<br>PC1: %{x:.2f}<br>PC2: %{y:.2f}<extra></extra>',
          marker: {
            size: isNoise ? 4 : 6,
            color: isNoise ? '#4a4a5a' : (pts.personas[0] ? undefined : CLUSTER_COLORS[idx % CLUSTER_COLORS.length]),
            opacity: isNoise ? 0.3 : 0.7,
            line: { width: 0.5, color: 'rgba(255,255,255,0.2)' },
          },
        };
      });
  }, [data, algorithm]);

  if (!data?.points?.length) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📈</div>
        <h3>No PCA Data</h3>
        <p>Run the pipeline to generate cluster visualizations.</p>
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
        margin: { l: 50, r: 20, t: 30, b: 50 },
        xaxis: {
          title: 'Principal Component 1',
          gridcolor: 'rgba(255,255,255,0.04)',
          zerolinecolor: 'rgba(255,255,255,0.06)',
          titlefont: { size: 12 },
        },
        yaxis: {
          title: 'Principal Component 2',
          gridcolor: 'rgba(255,255,255,0.04)',
          zerolinecolor: 'rgba(255,255,255,0.06)',
          titlefont: { size: 12 },
        },
        legend: {
          orientation: 'h',
          yanchor: 'bottom',
          y: 1.02,
          xanchor: 'center',
          x: 0.5,
          font: { size: 11 },
        },
        hoverlabel: {
          bgcolor: '#1a1a2e',
          bordercolor: '#7c3aed',
          font: { family: 'Inter', size: 12, color: '#f0f0f5' },
        },
      }}
      config={{
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: ['lasso2d', 'select2d'],
        responsive: true,
      }}
      style={{ width: '100%', height: '450px' }}
      useResizeHandler
    />
  );
}
