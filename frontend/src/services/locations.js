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
    description: locationData.description
    // 不发送image_url字段，后端模型中没有该字段
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
  console.log('开始更新位置，ID:', id);
  console.log('准备发送的位置数据详情:', JSON.stringify(locationData, null, 2));
  
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
    description: locationData.description
    // 不发送image_url字段，后端模型中没有该字段
  };
  
  try {
    console.log(`正在更新位置(ID: ${id}):`, apiPayload);
    const response = await api.put(`/locations/${id}`, apiPayload);
    
    if (!response.data) {
      throw new Error('更新位置时服务器未返回数据');
    }
    
    console.log(`位置更新返回数据(ID: ${id}):`, response.data);
    return response.data;
  } catch (error) {
    console.error('更新位置失败:', error);
    console.error('错误响应详情:', error.response?.data);
    console.error('请求参数:', JSON.stringify(locationData, null, 2));
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