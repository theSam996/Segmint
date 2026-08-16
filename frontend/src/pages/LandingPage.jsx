/**
 * Segmint — Landing Page & Interactive Workflow
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHealth, runPipeline } from '../api/client';

export default function LandingPage() {
  const navigate = useNavigate();
  const [health, setHealth] = useState(null);
  const [startingDemo, setStartingDemo] = useState(false);

  useEffect(() => {
    getHealth()
      .then(res => setHealth(res.data))
      .catch(() => {});
  }, []);

  const handleUseDemo = async () => {
    setStartingDemo(true);
    try {
      if (health?.data_available) {
        navigate('/dashboard');
      } else {
        await runPipeline({ source: 'demo' });
        navigate('/setup');
      }
    } catch {
      navigate('/setup');
    } finally {
      setStartingDemo(false);
    }
  };

  return (
    <div className="main-content">
      {/* Hero Section */}
      <div className="hero-section animate-in">
        <div className="hero-badge">
          ✨ Intelligent Customer Segmentation & RFM Engine
        </div>
        <h1 className="hero-title">
          Transform Raw Transactions into <br />
          <span className="text-gradient">Actionable Customer Personas</span>
        </h1>
        <p className="hero-subtitle">
          An end-to-end unsupervised data science pipeline. Ingest raw e-commerce records,
          engineer behavioral RFM features, execute K-Means & DBSCAN clustering, project in 2D PCA,
          and generate concrete marketing retention playbooks.
        </p>

        <div className="hero-actions">
          <button
            className="btn btn-primary btn-lg"
            onClick={handleUseDemo}
            disabled={startingDemo}
          >
            {startingDemo ? (
              <><div className="spinner" style={{ width: 16, height: 16 }}></div> Launching Demo...</>
            ) : (
              <>⚡ Use Demo Data (UCI Retail)</>
            )}
          </button>

          <button
            className="btn btn-secondary btn-lg"
            onClick={() => navigate('/setup')}
          >
            📁 Upload Custom Dataset
          </button>
        </div>

        {health?.data_available && (
          <div style={{ marginTop: 'var(--space-5)', fontSize: 'var(--text-xs)', color: 'var(--accent-emerald-light)' }}>
            ✓ Segmented data is already loaded and ready in memory. <span style={{ textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }} onClick={() => navigate('/dashboard')}>Open Dashboard →</span>
          </div>
        )}
      </div>

      {/* End-to-End Visual Workflow Section */}
      <div className="card mb-6 animate-in">
        <div className="card-header">
          <div>
            <h3>System Workflow & Data Contract Flowchart</h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
              Linear ETL + Unsupervised Machine Learning + Business Translation Layer
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/setup')}>
            Launch Workflow →
          </button>
        </div>
        <div className="card-body">
          <div className="workflow-diagram">
            {/* Step 1: Entry */}
            <div className="workflow-node highlight">
              <span>🌐</span> USER OPENS WEBSITE / LANDING PAGE
            </div>
            <div className="workflow-arrow">▼</div>

            {/* Branch: Demo vs Upload */}
            <div className="workflow-branch">
              <div
                className="workflow-node"
                style={{ cursor: 'pointer', borderColor: 'var(--accent-purple)' }}
                onClick={handleUseDemo}
              >
                <span>⚡</span> Use Demo Data (UCI Retail)
              </div>
              <div
                className="workflow-node"
                style={{ cursor: 'pointer', borderColor: 'var(--accent-blue)' }}
                onClick={() => navigate('/setup')}
              >
                <span>📁</span> Upload Custom Dataset
              </div>
            </div>
            <div className="workflow-arrow">▼</div>

            {/* Step 2: Setup & Validation */}
            <div className="workflow-node">
              <span>🔍</span> DATA VALIDATION (Schema Audit, Column Detection & Health Check)
            </div>
            <div className="workflow-arrow">▼</div>

            {/* Step 3: Pipeline Stages */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: 'var(--space-2)',
              width: '100%',
            }}>
              <div className="workflow-node flex-center" style={{ textAlign: 'center' }}>
                🧹 1. Cleaning
              </div>
              <div className="workflow-node flex-center" style={{ textAlign: 'center' }}>
                📊 2. RFM Engine
              </div>
              <div className="workflow-node flex-center" style={{ textAlign: 'center' }}>
                ⚙️ 3. Preprocessing
              </div>
              <div className="workflow-node flex-center" style={{ textAlign: 'center', borderColor: 'var(--accent-purple)' }}>
                🔬 4. K-Means + DBSCAN
              </div>
              <div className="workflow-node flex-center" style={{ textAlign: 'center' }}>
                📉 5. PCA Projection
              </div>
              <div className="workflow-node flex-center" style={{ textAlign: 'center', borderColor: 'var(--accent-emerald)' }}>
                🏷️ 6. Business Labeling
              </div>
            </div>
            <div className="workflow-arrow">▼</div>

            {/* Step 4: Dashboard & Sub-views */}
            <div className="workflow-node highlight" style={{ background: 'rgba(59, 130, 246, 0.15)', borderColor: 'var(--accent-blue)' }}>
              <span>📊</span> DASHBOARD HUB (Executive Overview)
            </div>
            <div className="workflow-arrow">▼</div>

            {/* Leaf nodes */}
            <div className="workflow-branch">
              <div
                className="workflow-node"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/customers')}
              >
                <span>👥</span> Customers View
              </div>
              <div
                className="workflow-node"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/segments')}
              >
                <span>🎯</span> Segments & Actions
              </div>
              <div
                className="workflow-node"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/analytics')}
              >
                <span>📈</span> Deep Analytics
              </div>
              <div
                className="workflow-node"
                style={{ cursor: 'pointer', borderColor: 'var(--accent-amber)' }}
                onClick={() => navigate('/comparison')}
              >
                <span>⚖️</span> Model Comparison
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Value Pillars Grid */}
      <div className="metrics-grid animate-in">
        <div className="card playbook-card">
          <div style={{ fontSize: '1.75rem' }}>🔄</div>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>Granularity Collapse</h3>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Transforms hundreds of thousands of raw transaction line-items into clean, customer-level
            behavioral matrices (Recency, Frequency, Monetary).
          </p>
        </div>

        <div className="card playbook-card">
          <div style={{ fontSize: '1.75rem' }}>🧠</div>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>Parallel ML Clustering</h3>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Runs K-Means (with silhouette score optimization) and DBSCAN (with k-distance density thresholding)
            side-by-side to separate dense core segments from outlier noise.
          </p>
        </div>

        <div className="card playbook-card">
          <div style={{ fontSize: '1.75rem' }}>💡</div>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>Business Translation Layer</h3>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Converts abstract mathematical centroids into human-readable customer personas
            with dedicated retention, upselling, and re-engagement playbooks.
          </p>
        </div>
      </div>
    </div>
  );
}
