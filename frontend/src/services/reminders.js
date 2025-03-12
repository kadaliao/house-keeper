import api from './api';

export const getReminders = async (params = {}) => {
  const response = await api.get('/reminders', { params });
  return response.data;
};

export const getReminder = async (id) => {
  const response = await api.get(`/reminders/${id}`);
  return response.data;
};

export const createReminder = async (reminderData) => {
  const response = await api.post('/reminders', reminderData);
  return response.data;
};

export const updateReminder = async (id, reminderData) => {
  const response = await api.put(`/reminders/${id}`, reminderData);
  return response.data;
};

export const deleteReminder = async (id) => {
  const response = await api.delete(`/reminders/${id}`);
  return response.data;
};

export const completeReminder = async (id) => {
  const response = await api.post(`/reminders/${id}/complete`);
  return response.data;
};

export const getDueReminders = async () => {
  const response = await api.get('/reminders', { params: { due: true } });
  return response.data;
};

export const getUpcomingReminders = async (days = 7) => {
  const response = await api.get('/reminders', { params: { upcoming: true, days } });
  return response.data;
};

export const getRemindersByItem = async (itemId) => {
  const response = await api.get('/reminders', { params: { item_id: itemId } });
  return response.data;
}; 