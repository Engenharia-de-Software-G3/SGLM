import axios from 'axios';

export const BASE_URL = import.meta.env.VITE_API_URL;
console.log('🔥 API URL:', BASE_URL);

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
