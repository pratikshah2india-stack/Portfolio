import api from './axios';

export const userRegister        = (data) => api.post('/api/user/register', data);
export const userVerifyOTP       = (data) => api.post('/api/user/verify-otp', data);
export const userResendOTP       = (data) => api.post('/api/user/resend-otp', data);
export const userLogin           = (data) => api.post('/api/user/login', data);
export const userForgotPassword  = (data) => api.post('/api/user/forgot-password', data);
export const userResetPassword   = (data) => api.post('/api/user/reset-password', data);

