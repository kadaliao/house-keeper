import api from './api';

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/uploads/images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  // 添加API基础URL前缀，确保前端能正确访问图片
  const apiBaseUrl = process.env.REACT_APP_API_URL || '/api/v1';
  const baseUrl = apiBaseUrl.replace('/api/v1', ''); // 获取API基础URL
  
  const imageUrl = response.data.url;
  // 返回完整URL
  return {
    ...response.data,
    url: `${baseUrl}${imageUrl}`
  };
}; 