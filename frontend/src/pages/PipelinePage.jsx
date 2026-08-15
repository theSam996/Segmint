/**
 * Segmint — Pipeline Page
 * Run, monitor, and inspect the data pipeline.
 */

import { useState, useEffect } from 'react';
import { getPipelineStatus, runPipeline } from '../api/client';
import { formatDuration } from '../utils/formatters';

const PIPELINE_STAGES = [
  { key: 'downloading', label: 'Download Dataset', icon: '⬇️', desc: 'Fetch UCI Online Retail data from archive' },
  { key: 'cleaning', label: 'Data Cleaning', icon: '🧹', desc: 'Drop nulls, cancellations, invalid rows' },
  { key: 'rfm_calculation', label: 'RFM Calculation', icon: '📊', desc: 'Compute Recency, Frequency, Monetary per customer' },
  { key: 'preprocessing', label: 'Feature Scaling', icon: '⚙️', desc: 'Log-transform, Winsorize, StandardScaler' },
  { key: 'clustering', label: 'Clustering', icon: '🔬', desc: 'K-Means + DBSCAN with parameter optimization' },
  { key: 'visualization', label: 'PCA Projection', icon: '📉', desc: '3D → 2D dimensionality reduction for plotting' },
  { key: 'labeling', label: 'Business Labeling', icon: '🏷️', desc: 'Assign personas and recommended actions' },
];

export default function PipelinePage() {
  const [status, setStatus] = useState(null);
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState(null);

  const fetchStatus = async () => {
    try {
      const res = await getPipelineStatus();
      setStatus(res.data);
    } catch {
      // API not available
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleRun = async () => {
    setLaunching(true);
    setError(null);
    try {
      await runPipeline();
      // Polling will pick up the new status
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to start pipeline');
    } finally {
      setLaunching(false);
    }
  };

  const isRunning = status?.status === 'running';
  const isCompleted = status?.status === 'completed';
  const isError = status?.status === 'error';

  const getStageStatus = (stageKey) => {
    if (!isRunning && !isCompleted) return 'pending';

    const stageIdx = PIPELINE_STAGES.findIndex(s => s.key === stageKey);
    const currentIdx = PIPELINE_STAGES.findIndex(s => s.key === status?.current_stage);

    if (isCompleted || status?.current_stage === 'done') return 'completed';
    if (stageIdx < currentIdx) return 'completed';
    if (stageIdx === currentIdx) return 'running';
    return 'pending';
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <h2>Pipeline</h2>
        <p>Run and monitor the Segmint data pipeline</p>
      </div>

      {/* Run Control Card */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card-body">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-4)',
          }}>
            <div>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-1)' }}>
                {isRunning ? '⚡ Pipeline Running...' :
                 isCompleted ? '✅ Pipeline Complete' :
                 isError ? '❌ Pipeline Error' :
                 '🚀 Ready to Run'}
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                {isRunning ? `Stage: ${status?.current_stage || 'initializing'}` :
                 isCompleted ? `Completed in ${formatDuration(status?.duration)}` :
                 isError ? status?.error :
                 'Download data, clean, compute RFM, cluster, and label segments'}
              </p>
            </div>

            <button
              className="btn btn-primary btn-lg"
              onClick={handleRun}
              disabled={isRunning || launching}
            >
              {launching ? (
                <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></div> Starting...</>
              ) : isRunning ? (
                <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></div> Running...</>
              ) : (
                <>▶ Run Pipeline</>
              )}
            </button>
          </div>

          {/* Progress Bar */}
          {isRunning && (
            <div style={{ marginTop: 'var(--space-4)' }}>
              <div className="flex-between mb-4" style={{ marginBottom: 'var(--space-2)' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Progress</span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-accent)' }}>
                  {status?.progress || 0}%
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${status?.progress || 0}%` }}
                ></div>
              </div>
            </div>
          )}

          {error && (
            <div style={{
              marginTop: 'var(--space-4)',
              padding: 'var(--space-3) var(--space-4)',
              background: 'rgba(239, 68, 68, 0.08)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--accent-rose-light)',
              fontSize: 'var(--text-sm)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}>
              {error}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
        {/* Pipeline Stages */}
        <div className="card">
          <div className="card-header">
            <h3>Pipeline Stages</h3>
          </div>
          <div className="card-body">
            {PIPELINE_STAGES.map((stage, idx) => {
              const stageStatus = getStageStatus(stage.key);
              return (
                <div className="pipeline-stage" key={stage.key}>
                  <div className={`pipeline-stage-icon ${stageStatus}`}>
                    {stageStatus === 'completed' ? '✓' :
                     stageStatus === 'running' ? '⟳' :
                     idx + 1}
                  </div>
                  <div className="pipeline-stage-content">
                    <h4 style={{
                      color: stageStatus === 'pending' ? 'var(--text-muted)' : 'var(--text-primary)',
                    }}>
                      {stage.icon} {stage.label}
                    </h4>
                    <p>{stage.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Results Panel */}
        <div className="card">
          <div className="card-header">
            <h3>Pipeline Results</h3>
          </div>
          <div className="card-body">
            {isCompleted && status?.results ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {/* Summary Stats */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 'var(--space-3)',
                }}>
                  <div className="card" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>Duration</div>
                    <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {formatDuration(status.duration)}
                    </div>
                  </div>
                  <div className="card" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>Customers</div>
                    <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--accent-purple-light)' }}>
                      {status.results.summary?.total_customers?.toLocaleString() || '—'}
                    </div>
                  </div>
                  <div className="card" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>Clusters</div>
                    <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--accent-blue-light)' }}>
                      {status.results.summary?.clusters_found || '—'}
                    </div>
                  </div>
                  <div className="card" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>Date Range</div>
                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {status.results.summary?.data_date_range || '—'}
                    </div>
                  </div>
                </div>

                {/* Stage Details */}
                {status.results.stages?.clustering && (
                  <div style={{
                    padding: 'var(--space-4)',
                    background: 'rgba(124, 58, 237, 0.04)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(124, 58, 237, 0.08)',
                  }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--accent-purple-light)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
                      Clustering Results
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span>K-Means: k={status.results.stages.clustering.kmeans?.k}, silhouette={status.results.stages.clustering.kmeans?.silhouette?.toFixed(4)}</span>
                      <span>DBSCAN: {status.results.stages.clustering.dbscan?.n_clusters} clusters, {status.results.stages.clustering.dbscan?.n_noise} noise ({status.results.stages.clustering.dbscan?.noise_pct}%)</span>
                    </div>
                  </div>
                )}

                <button
                  className="btn btn-secondary"
                  onClick={() => window.location.href = '/'}
                  style={{ marginTop: 'var(--space-2)' }}
                >
                  View Dashboard →
                </button>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                <div className="empty-state-icon">📋</div>
                <h3>{isRunning ? 'Processing...' : 'No Results Yet'}</h3>
                <p>{isRunning ? 'Results will appear here when the pipeline completes.' : 'Run the pipeline to see results.'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
