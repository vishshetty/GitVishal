import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:8000/api');

export const jiraApi = {
    test: (data) => axios.post(`${API_BASE}/connections/jira/test`, data).then(r => r.data),
    save: (data) => axios.post(`${API_BASE}/connections/jira`, data).then(r => r.data),
    getAll: () => axios.get(`${API_BASE}/connections/jira`).then(r => r.data),
    delete: (id) => axios.delete(`${API_BASE}/connections/jira/${id}`).then(r => r.data),
};

export const llmApi = {
    test: (data) => axios.post(`${API_BASE}/connections/llm/test`, data).then(r => r.data),
    save: (data) => axios.post(`${API_BASE}/connections/llm`, data).then(r => r.data),
    getAll: () => axios.get(`${API_BASE}/connections/llm`).then(r => r.data),
};

export const issuesApi = {
    fetch: (data) => axios.post(`${API_BASE}/issues/fetch`, data).then(r => r.data),
};

export const planApi = {
    generate: (data) => axios.post(`${API_BASE}/testplan/generate`, data).then(r => r.data),
    downloadDocxUrl: (id) => `${API_BASE}/testplan/${id}/download`,
};

export const historyApi = {
    getAll: () => axios.get(`${API_BASE}/history`).then(r => r.data),
    delete: (id) => axios.delete(`${API_BASE}/history/${id}`).then(r => r.data),
};
