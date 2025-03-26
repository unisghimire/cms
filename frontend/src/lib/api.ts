import axios from 'axios';
import { supabase } from './supabase';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // This is important for CORS with credentials
});

// Add auth token to requests
axiosInstance.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.access_token) {
    config.headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle response errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized error (e.g., redirect to login)
      const { error: signOutError } = await supabase.auth.signOut();
      if (!signOutError) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const api = {
  get: async (endpoint: string) => {
    const response = await axiosInstance.get(endpoint);
    return response.data;
  },
  post: async (endpoint: string, body: any) => {
    const response = await axiosInstance.post(endpoint, body);
    return response.data;
  },
  put: async (endpoint: string, body: any) => {
    const response = await axiosInstance.put(endpoint, body);
    return response.data;
  },
}; 