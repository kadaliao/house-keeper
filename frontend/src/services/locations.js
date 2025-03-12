import api from './api';

export const getLocations = async (params = {}) => {
  const response = await api.get('/locations', { params });
  return response.data;
};

export const getLocationTree = async () => {
  const response = await api.get('/locations/tree');
  return response.data;
};

export const getLocation = async (id) => {
  const response = await api.get(`/locations/${id}`);
  return response.data;
};

export const createLocation = async (locationData) => {
  const response = await api.post('/locations', locationData);
  return response.data;
};

export const updateLocation = async (id, locationData) => {
  const response = await api.put(`/locations/${id}`, locationData);
  return response.data;
};

export const deleteLocation = async (id) => {
  const response = await api.delete(`/locations/${id}`);
  return response.data;
};

export const getLocationsByParent = async (parentId) => {
  const response = await api.get('/locations', { params: { parent_id: parentId } });
  return response.data;
}; 