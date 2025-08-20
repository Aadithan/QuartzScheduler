import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'https://localhost:7057/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging requests (authentication removed)
api.interceptors.request.use(
  (config) => {
    // No authentication needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Authentication removed - no 401 handling needed
    return Promise.reject(error);
  }
);

export default api;