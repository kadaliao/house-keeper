import api from './api';

export const getLocations = async (params = {}) => {
  try {
    const response = await api.get('/locations', { params });
    console.log('获取位置列表返回数据:', response.data);
    return response.data;
  } catch (error) {
    console.error('获取位置列表失败:', error);
    throw error;
  }
};

export const getLocationTree = async () => {
  try {
    const response = await api.get('/locations/tree');
    return response.data;
  } catch (error) {
    console.error('获取位置树失败:', error);
    throw error;
  }
};

export const getLocation = async (id) => {
  if (!id) {
    throw new Error('位置ID不能为空');
  }
  
  try {
    const response = await api.get(`/locations/${id}`);
    return response.data;
  } catch (error) {
    console.error(`获取位置详情失败 (ID: ${id}):`, error);
    throw error;
  }
};

export const createLocation = async (locationData) => {
  if (!locationData || !locationData.name) {
    throw new Error('位置名称不能为空');
  }
  
  // 映射字段名称，确保与API一致
  const apiPayload = {
    name: locationData.name,
    parent_id: locationData.parent_id,
    description: locationData.description,
    image_url: locationData.image_url
  };
  
  try {
    console.log('正在创建位置:', apiPayload);
    const response = await api.post('/locations', apiPayload);
    console.log('位置创建返回数据:', response.data);
    return response.data;
  } catch (error) {
    console.error('创建位置失败:', error, locationData);
    throw error;
  }
};

export const updateLocation = async (id, locationData) => {
  if (!id) {
    throw new Error('位置ID不能为空');
  }
  
  if (!locationData || !locationData.name) {
    throw new Error('位置名称不能为空');
  }
  
  // 映射字段名称，确保与API一致
  const apiPayload = {
    name: locationData.name,
    parent_id: locationData.parent_id,
    description: locationData.description,
    image_url: locationData.image_url
  };
  
  try {
    console.log(`正在更新位置(ID: ${id}):`, apiPayload);
    const response = await api.put(`/locations/${id}`, apiPayload);
    console.log(`位置更新返回数据(ID: ${id}):`, response.data);
    return response.data;
  } catch (error) {
    console.error(`更新位置失败 (ID: ${id}):`, error, locationData);
    throw error;
  }
};

export const deleteLocation = async (id) => {
  if (!id) {
    throw new Error('位置ID不能为空');
  }
  
  try {
    const response = await api.delete(`/locations/${id}`);
    return response.data;
  } catch (error) {
    console.error(`删除位置失败 (ID: ${id}):`, error);
    throw error;
  }
};

export const getLocationsByParent = async (parentId) => {
  try {
    const response = await api.get('/locations', { params: { parent_id: parentId } });
    return response.data;
  } catch (error) {
    console.error(`获取子位置失败 (父ID: ${parentId}):`, error);
    throw error;
  }
}; 