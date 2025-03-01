import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  // Explicitly set the URL for now to help debug
  baseURL: 'http://localhost:5000', // Try hardcoding this temporarily to test
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

// Add a response interceptor with better error logging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    // Handle errors globally here with more detailed logging
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error - Server responded with:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
        url: error.config.url
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Error - No response received:', {
        request: error.request,
        url: error.config.url,
        method: error.config.method,
        baseURL: error.config.baseURL
      });
      
      // For development debugging - help message for common issues
      console.error(
        'Network Error Troubleshooting:\n' +
        '1. Is your backend server running?\n' +
        `2. Check if the URL ${error.config.baseURL}${error.config.url} is correct\n` +
        '3. Check for CORS issues in your browser console\n' +
        '4. Verify network connectivity\n'
      );
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Error - Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;