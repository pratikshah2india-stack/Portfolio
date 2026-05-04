import api from './axios';

export const loginUser = (credentials) => api.post('/api/auth/login', credentials);
export const registerUser = (credentials) => api.post('/api/auth/register', credentials);
