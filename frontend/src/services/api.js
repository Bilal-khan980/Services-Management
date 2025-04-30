import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Check if we're in a browser environment
      if (typeof window !== 'undefined') {
        // Check if the error is related to authentication
        const isAuthError =
          error.response.data?.error?.toLowerCase().includes('token') ||
          error.response.data?.error?.toLowerCase().includes('auth') ||
          error.response.data?.error?.toLowerCase().includes('unauthorized') ||
          error.response.data?.error?.toLowerCase().includes('not authorized');

        // Only redirect to login for authentication errors and if not already on a login-related page
        const currentPath = window.location.pathname;
        if (isAuthError &&
            !currentPath.includes('/login') &&
            !currentPath.includes('/register') &&
            !currentPath.includes('/forgot-password') &&
            !currentPath.includes('/reset-password')) {
          console.log('Authentication error. Redirecting to login...');
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
