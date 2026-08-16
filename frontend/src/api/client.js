/**
 * Segmint — API Client
 * Axios wrapper for backend communication.
 */

import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 180000, // 3 min timeout for heavy pipeline runs
});

// --- Health ---
export const getHealth = () => api.get('/health');

// --- Pipeline & Ingestion ---
export const getPipelineStatus = () => api.get('/pipeline/status');
export const runPipeline = (payload = { source: 'demo' }) => api.post('/pipeline/run', payload);
export const uploadDataset = (formData) =>
  api.post('/pipeline/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const validateMapping = (payload) => api.post('/pipeline/validate', payload);
export const getSampleTemplateUrl = () => `${API_BASE}/pipeline/sample-template`;

// --- Customers ---
export const getCustomers = (params = {}) => api.get('/customers', { params });
export const getCustomer = (customerId) => api.get(`/customers/${customerId}`);

// --- Clusters & Visualization ---
export const getClusterSummary = () => api.get('/clusters/summary');
export const getPCAData = () => api.get('/clusters/pca');
export const getDistribution = (metric = 'monetary') =>
  api.get('/clusters/distribution', { params: { metric } });

// --- Advanced Analytics & Model Comparison ---
export const getModelComparison = () => api.get('/clusters/comparison');
export const getAnalytics = () => api.get('/clusters/analytics');

export default api;
