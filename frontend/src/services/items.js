import api from './api';

export const getItems = async (params = {}) => {
  const response = await api.get('/items', { params });
  return response.data;
};

export const getItem = async (id) => {
  const response = await api.get(`/items/${id}`);
  return response.data;
};

export const createItem = async (itemData) => {
  const response = await api.post('/items', itemData);
  return response.data;
};

export const updateItem = async (id, itemData) => {
  const response = await api.put(`/items/${id}`, itemData);
  return response.data;
};

export const deleteItem = async (id) => {
  const response = await api.delete(`/items/${id}`);
  return response.data;
};

export const searchItems = async (params = {}) => {
  try {
    console.log('搜索物品请求参数:', params);
    const response = await api.get('/items', { params });
    console.log('搜索物品结果:', response.data);
    return response.data;
  } catch (error) {
    console.error('搜索物品失败:', error);
    throw error;
  }
};

export const getItemsByCategory = async (category) => {
  const response = await api.get('/items', { params: { category } });
  return response.data;
};

export const getItemsByLocation = async (locationId) => {
  const response = await api.get('/items', { params: { location_id: locationId } });
  return response.data;
}; 