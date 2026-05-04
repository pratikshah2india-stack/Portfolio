import api from './axios';

export const sendMessage = (data) => api.post('/api/messages', data);
export const getMessages = () => api.get('/api/messages');
export const deleteMessage = (id) => api.delete(`/api/messages/${id}`);
