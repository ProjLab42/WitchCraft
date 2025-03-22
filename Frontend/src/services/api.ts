import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  // Explicitly set the URL for now to help debug
  baseURL: 'http://localhost:5003', // Try hardcoding this temporarily to test
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
  timeout: 15000, // Increase timeout for debugging
});

// Debug middleware to log requests
api.interceptors.request.use(request => {
  console.log('API Request:', {
    url: request.url,
    method: request.method,
    data: request.data,
    baseURL: request.baseURL,
    fullURL: `${request.baseURL}${request.url}`
  });
  return request;
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // You can modify request config here (like adding auth headers)
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('authToken='))
      ?.split('=')[1];

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    // Return a rejected promise but with more context
    return Promise.reject({
      originalError: error,
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
);

// Increase timeout for debugging
api.defaults.timeout = 30000; 

export default api;