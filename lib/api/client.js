import axios from 'axios';

/**
 * API Client
 * 
 * Centralized axios instance with interceptors for authentication
 * and error handling.
 */

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor untuk menambahkan auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from session (this will be handled by the caller)
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor untuk handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 401:
          // Unauthorized - redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/?expired=true';
          }
          break;
        case 403:
          // Forbidden - user doesn't have permission
          console.error('Access forbidden:', error.response.data);
          break;
        case 404:
          // Not found
          console.error('Resource not found:', error.config.url);
          break;
        case 500:
          // Server error
          console.error('Server error:', error.response.data);
          break;
        default:
          console.error('API error:', error.response.data);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network error - no response received');
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

/**
 * Create authenticated API client with token
 * @param {string} token - JWT access token
 * @returns {AxiosInstance} - Axios instance with auth header
 */
export const createAuthenticatedClient = (token) => {
  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  // Add same response interceptor
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        if (typeof window !== 'undefined') {
          window.location.href = '/?expired=true';
        }
      }
      return Promise.reject(error);
    }
  );

  return client;
};

export default apiClient;
