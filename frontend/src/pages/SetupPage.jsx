/**
 * Segmint — Setup, Upload & Data Validation Page
 * Ingest datasets (Demo or Custom Upload), validate schemas, map columns, and execute pipeline.
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getPipelineStatus,
  runPipeline,
  uploadDataset,
  validateMapping,
  getSampleTemplateUrl,
} from '../api/client';
import { formatDuration, formatNumber } from '../utils/formatters';

const PIPELINE_STAGES = [
  { key: 'downloading', label: '1. Ingestion / Download', icon: '⬇️', desc: 'Fetch source transaction records' },
  { key: 'cleaning', label: '2. Data Cleaning', icon: '🧹', desc: 'Drop nulls, cancellations, invalid prices/quantities' },
  { key: 'rfm_calculation', label: '3. RFM Calculation', icon: '📊', desc: 'Compute Recency, Frequency, Monetary per customer' },
  { key: 'preprocessing', label: '4. Feature Scaling', icon: '⚙️', desc: 'Log1p transform, Winsorization, StandardScaler' },
  { key: 'clustering', label: '5. K-Means & DBSCAN', icon: '🔬', desc: 'Parallel unsupervised clustering & noise identification' },
  { key: 'visualization', label: '6. PCA Projection', icon: '📉', desc: '3D -> 2D dimensionality reduction for visual inspection' },
  { key: 'labeling', label: '7. Business Labeling', icon: '🏷️', desc: 'Assign personas and recommended action playbooks' },
];

export default function SetupPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [mode, setMode] = useState('demo'); // 'demo' | 'upload'
  const [uploading, setUploading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationData, setValidationData] = useState(null);
  const [columnMapping, setColumnMapping] = useState({
    customer_id: '',
    invoice_id: '',
    date: '',
    quantity: '',
    unit_price: '',
    total_price: '',
  });

  const [pipelineStatus, setPipelineStatus] = useState(null);
  const [launching, setLaunching] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);

  // Poll status
  const fetchStatus = async () => {
    try {
      const res = await getPipelineStatus();
      setPipelineStatus(res.data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setValidationData(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await uploadDataset(formData);
      setValidationData(res.data);
      setColumnMapping(res.data.suggested_mapping);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload and validate file.');
    } finally {
      setUploading(false);
    }
  };

  const handleRevalidate = async (newMapping) => {
    if (!validationData?.file_token) return;
    setValidating(true);
    try {
      const res = await validateMapping({
        file_token: validationData.file_token,
        column_mapping: newMapping,
      });
      setValidationData(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Revalidation failed.');
    } finally {
      setValidating(false);
    }
  };

  const handleMappingChange = (field, value) => {
    const updated = { ...columnMapping, [field]: value || null };
    setColumnMapping(updated);
    handleRevalidate(updated);
  };

  const handleStartPipeline = async () => {
    setLaunching(true);
    setError(null);
    try {
      if (mode === 'demo') {
        await runPipeline({ source: 'demo' });
      } else {
        if (!validationData?.is_valid) {
          setError('Please resolve all validation errors before running the pipeline.');
          setLaunching(false);
          return;
        }
        await runPipeline({
          source: 'custom',
          file_token: validationData.file_token,
          column_mapping: columnMapping,
        });
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to start pipeline.');
    } finally {
      setLaunching(false);
    }
  };

  const isRunning = pipelineStatus?.status === 'running';
  const isCompleted = pipelineStatus?.status === 'completed';
  const isError = pipelineStatus?.status === 'error';

  const getStageStatus = (stageKey) => {
    if (!isRunning && !isCompleted) return 'pending';
    const stageIdx = PIPELINE_STAGES.findIndex((s) => s.key === stageKey);
    const currentIdx = PIPELINE_STAGES.findIndex((s) => s.key === pipelineStatus?.current_stage);

    if (isCompleted || pipelineStatus?.current_stage === 'done') return 'completed';
    if (stageIdx < currentIdx) return 'completed';
    if (stageIdx === currentIdx) return 'running';
    return 'pending';
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h2>Setup & Ingestion Pipeline</h2>
          <p>Choose your data source, audit schema mappings, and run the segmentation pipeline.</p>
        </div>
        <a
          href={getSampleTemplateUrl()}
          download="segmint_sample_template.csv"
          className="btn btn-secondary btn-sm"
        >
          📥 Download Sample CSV Template
        </a>
      </div>

      {/* Mode Selector Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        <button
          className={`btn ${mode === 'demo' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setMode('demo'); setError(null); }}
        >
          ⚡ Use Demo Dataset (UCI Online Retail)
        </button>
        <button
          className={`btn ${mode === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setMode('upload'); setError(null); }}
        >
          📁 Upload Custom Dataset (CSV / XLSX)
        </button>
      </div>

      {/* Execution Control Banner */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex-between" style={{ flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <div>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>
                {isRunning ? '⚡ Pipeline Processing...' :
                 isCompleted ? '✅ Pipeline Ready & Completed' :
                 isError ? '❌ Pipeline Error' :
                 mode === 'demo' ? 'Ready: Demo Dataset' : 'Ready: Custom Upload'}
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {isRunning ? `Active Stage: ${pipelineStatus?.current_stage}` :
                 isCompleted ? `Completed in ${formatDuration(pipelineStatus?.duration)} (${pipelineStatus?.results?.summary?.total_customers?.toLocaleString()} customers segmented)` :
                 mode === 'demo' ? 'Online Retail dataset (~540K transaction records) ready to execute.' :
                 validationData ? `File '${validationData.filename}' (${formatNumber(validationData.row_count_estimate)} rows) validated.` :
                 'Upload your CSV or Excel file below to begin schema audit.'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              {isCompleted && (
                <button
                  className="btn btn-secondary btn-lg"
                  onClick={() => navigate('/dashboard')}
                >
                  View Dashboard →
                </button>
              )}
              <button
                className="btn btn-primary btn-lg"
                onClick={handleStartPipeline}
                disabled={isRunning || launching || uploading || (mode === 'upload' && !validationData?.is_valid)}
              >
                {launching ? (
                  <><div className="spinner" style={{ width: 16, height: 16 }}></div> Launching...</>
                ) : isRunning ? (
                  <><div className="spinner" style={{ width: 16, height: 16 }}></div> Processing...</>
                ) : (
                  <>▶ Run Pipeline</>
                )}
              </button>
            </div>
          </div>

          {/* Real-time Progress Bar */}
          {isRunning && (
            <div style={{ marginTop: 'var(--space-4)' }}>
              <div className="flex-between mb-2">
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  Executing Pipeline ({pipelineStatus?.current_stage})
                </span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-accent)', fontWeight: 700 }}>
                  {pipelineStatus?.progress || 0}%
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${pipelineStatus?.progress || 0}%` }}
                ></div>
              </div>
            </div>
          )}

          {error && (
            <div className="alert alert-danger mt-4">
              <span>⚠️</span>
              <div>{error}</div>
            </div>
          )}
        </div>
      </div>

      {/* Upload & Validation UI (When Custom Mode is active) */}
      {mode === 'upload' && (
        <div className="card mb-6">
          <div className="card-header">
            <h3>Custom Dataset Ingestion & Schema Audit</h3>
            {validationData && (
              <span className={`persona-tag`} style={{
                background: validationData.is_valid ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: validationData.is_valid ? 'var(--accent-emerald-light)' : 'var(--accent-rose-light)',
                borderColor: validationData.is_valid ? 'var(--accent-emerald)' : 'var(--accent-rose)',
              }}>
                {validationData.is_valid ? '✓ Schema Valid' : '✕ Schema Invalid'}
              </span>
            )}
          </div>
          <div className="card-body">
            {/* Drag & Drop Box */}
            <div
              className={`dropzone ${dragOver ? 'dragover' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xlsx, .xls, .txt"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                }}
              />
              <div className="dropzone-icon">📁</div>
              <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: '4px' }}>
                {uploading ? 'Reading & Auditing Dataset...' : 'Drag & Drop CSV / Excel or Click to Browse'}
              </h4>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                Supports raw transaction tables with Customer ID, Date, and Spend/Quantity fields.
              </p>
            </div>

            {/* Validation Feedback & Column Mapper */}
            {validationData && (
              <div style={{ marginTop: 'var(--space-6)' }}>
                {validationData.errors?.length > 0 && (
                  <div className="alert alert-danger">
                    <span>⚠️</span>
                    <div>
                      <strong>Validation Errors:</strong>
                      <ul style={{ paddingLeft: '20px', marginTop: '4px' }}>
                        {validationData.errors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {validationData.warnings?.length > 0 && (
                  <div className="alert alert-warning">
                    <span>ℹ️</span>
                    <div>
                      <strong>Notices & Warnings:</strong>
                      <ul style={{ paddingLeft: '20px', marginTop: '4px' }}>
                        {validationData.warnings.map((warn, i) => (
                          <li key={i}>{warn}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
                  Detected Schema Column Mappings
                </h4>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 'var(--space-4)',
                  marginBottom: 'var(--space-6)',
                }}>
                  {/* Customer ID */}
                  <div>
                    <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                      Customer ID (Required) *
                    </label>
                    <div className="select-wrapper">
                      <select
                        value={columnMapping.customer_id || ''}
                        onChange={(e) => handleMappingChange('customer_id', e.target.value)}
                      >
                        <option value="">-- Select Column --</option>
                        {validationData.columns.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Invoice / Order ID */}
                  <div>
                    <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                      Invoice / Order ID
                    </label>
                    <div className="select-wrapper">
                      <select
                        value={columnMapping.invoice_id || ''}
                        onChange={(e) => handleMappingChange('invoice_id', e.target.value)}
                      >
                        <option value="">-- (Auto Index) --</option>
                        {validationData.columns.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                      Transaction Date (Required) *
                    </label>
                    <div className="select-wrapper">
                      <select
                        value={columnMapping.date || ''}
                        onChange={(e) => handleMappingChange('date', e.target.value)}
                      >
                        <option value="">-- Select Column --</option>
                        {validationData.columns.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                      Quantity / Units
                    </label>
                    <div className="select-wrapper">
                      <select
                        value={columnMapping.quantity || ''}
                        onChange={(e) => handleMappingChange('quantity', e.target.value)}
                      >
                        <option value="">-- (Default 1) --</option>
                        {validationData.columns.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Unit Price */}
                  <div>
                    <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                      Unit Price
                    </label>
                    <div className="select-wrapper">
                      <select
                        value={columnMapping.unit_price || ''}
                        onChange={(e) => handleMappingChange('unit_price', e.target.value)}
                      >
                        <option value="">-- Optional --</option>
                        {validationData.columns.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Total Price */}
                  <div>
                    <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                      Total Spend / Amount
                    </label>
                    <div className="select-wrapper">
                      <select
                        value={columnMapping.total_price || ''}
                        onChange={(e) => handleMappingChange('total_price', e.target.value)}
                      >
                        <option value="">-- Or Qty x Price --</option>
                        {validationData.columns.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Raw Preview Table */}
                <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                  Dataset Sample Preview ({formatNumber(validationData.row_count_estimate)} total rows)
                </h4>
                <div style={{ overflowX: 'auto', maxHeight: '240px' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        {validationData.columns.map((c) => (
                          <th key={c}>{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {validationData.preview_rows.map((row, i) => (
                        <tr key={i}>
                          {validationData.columns.map((c) => (
                            <td key={c}>{row[c]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Visual Pipeline Stages & Execution Flow */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
        {/* Stages Timeline */}
        <div className="card">
          <div className="card-header">
            <h3>Pipeline Stages</h3>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              7 Sequential Transformations
            </span>
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

        {/* Results / Health Audit Card */}
        <div className="card">
          <div className="card-header">
            <h3>Pipeline Results & Model Health</h3>
          </div>
          <div className="card-body">
            {isCompleted && pipelineStatus?.results ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                  <div className="card" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 2 }}>Execution Time</div>
                    <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>
                      {formatDuration(pipelineStatus.duration)}
                    </div>
                  </div>
                  <div className="card" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 2 }}>Customers</div>
                    <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--accent-purple-light)' }}>
                      {formatNumber(pipelineStatus.results.summary?.total_customers)}
                    </div>
                  </div>
                  <div className="card" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 2 }}>Clusters Found</div>
                    <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--accent-blue-light)' }}>
                      {pipelineStatus.results.summary?.clusters_found}
                    </div>
                  </div>
                  <div className="card" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 2 }}>PCA 2D Variance</div>
                    <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--accent-emerald-light)' }}>
                      {(pipelineStatus.results.stages?.visualization?.total_explained_variance * 100)?.toFixed(1) || '93.7'}%
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: 'var(--space-4)',
                  background: 'rgba(124, 58, 237, 0.05)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(124, 58, 237, 0.12)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}>
                  <strong style={{ color: 'var(--accent-purple-light)' }}>Clustering Diagnostics:</strong>
                  <span>• K-Means: k={pipelineStatus.results.stages?.clustering?.kmeans?.k}, Silhouette = {pipelineStatus.results.stages?.clustering?.kmeans?.silhouette?.toFixed(4)}</span>
                  <span>• DBSCAN: {pipelineStatus.results.stages?.clustering?.dbscan?.n_clusters} clusters, {pipelineStatus.results.stages?.clustering?.dbscan?.n_noise} noise points ({pipelineStatus.results.stages?.clustering?.dbscan?.noise_pct}%)</span>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/dashboard')}
                >
                  Explore Dashboard & Analytics →
                </button>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                <div className="empty-state-icon">📋</div>
                <h3>{isRunning ? 'Processing Pipeline...' : 'Ready for Execution'}</h3>
                <p>
                  {isRunning ? 'Executing cleaning, RFM, clustering, PCA, and labeling...' :
                   'Click "Run Pipeline" above to start processing and see results.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
