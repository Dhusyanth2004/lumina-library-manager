import axios from 'axios';
import axiosRetry from 'axios-retry';

const api = axios.create({
  baseURL: 'https://lumina-library-manager-1.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configure axios-retry
axiosRetry(api, { 
  retries: 3, 
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // Retry on network errors or 5xx status codes
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || (error.response?.status && error.response.status >= 500);
  }
});

// Request interceptor to add the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lumina_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    // Handle 401/403 (Unauthorized/Forbidden)
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      console.warn('Authentication failed, logging out...');
      
      // Clear auth data
      localStorage.removeItem('lumina_auth');
      localStorage.removeItem('lumina_user');
      localStorage.removeItem('lumina_role');
      localStorage.removeItem('lumina_token');
      
      // We don't use window.location.reload() here to avoid infinite loops,
      // but the App component will react to the missing localStorage on the next state update or refresh.
      // However, for a smoother experience, we could emit an event or use a state management trigger.
    }

    return Promise.reject(error);
  }
);

export default api;
