// import axios from 'axios';
// import { useAuthStore } from '../stores/authStore';

// const api = axios.create({
//   baseURL: import.meta.env.VITE_BACKEND_URL || "https://hopsital-management-system.onrender.com/",
//   headers: {
//     'Content-Type': 'application/x-www-form-urlencoded',
//   },
//   withCredentials: true,
// });


// api.interceptors.request.use((config) => {
//   console.log('Axios Request:', {
//     url: config.url,
//     method: config.method,
//     headers: config.headers,
//     data: config.data instanceof FormData
//       ? Object.fromEntries(config.data)
//       : config.data instanceof URLSearchParams
//       ? config.data.toString()
//       : config.data,
//   });
//   const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] || useAuthStore.getState().token;
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   } else {
//     console.warn('No JWT token found in auth store or cookie');
//   }
//   return config;
// });

// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       useAuthStore.getState().logout();
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;

import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "https://hopsital-management-system.onrender.com",
  headers: {
    'Content-Type': 'application/json', // Default to JSON
  },
  withCredentials: true,
  timeout: 30000, // 30 second timeout
});

api.interceptors.request.use((config) => {
  console.log('Axios Request:', {
    url: config.url,
    method: config.method,
    headers: config.headers,
    data: config.data instanceof FormData
      ? Object.fromEntries(config.data)
      : config.data instanceof URLSearchParams
      ? config.data.toString()
      : config.data,
  });
  
  // Get token from store first, then cookie as fallback
  const token = useAuthStore.getState().token || 
    document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn('No JWT token found in auth store or cookie');
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('Axios Response:', response);
    return response;
  },
  (error) => {
    console.error('Axios Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: error.config
    });
    
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;