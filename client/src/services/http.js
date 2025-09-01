// src/api/http.js
import axios from 'axios';

// For CRA/Webpack, environment vars must be prefixed with REACT_APP_
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const http = axios.create({ baseURL });

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (!config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

export default http;