import api from './api';

/**
 * 上传图片到服务器
 * @param {File} file - 要上传的图片文件
 * @returns {Promise<{url: string}>} - 包含上传后图片URL的对象
 */
export const uploadImage = async (file) => {
  console.log('开始上传图片:', file.name, 'API URL:', api.defaults.baseURL);
  
  // 创建FormData对象添加文件
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await api.post('/uploads/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('上传图片API响应:', response.data);
    
    if (!response.data || !response.data.url) {
      throw new Error('上传接口返回的数据中没有图片URL');
    }
    
    // 提取API基础URL和图片URL
    const apiBaseUrl = process.env.REACT_APP_API_URL || '/api/v1';
    const baseUrl = apiBaseUrl.endsWith('/api/v1') 
      ? apiBaseUrl.replace('/api/v1', '') 
      : '';
    
    const imageUrl = response.data.url;
    const fullUrl = imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`;
    
    console.log('处理后的完整URL:', fullUrl);
    
    // 返回带有完整URL的响应
    return {
      ...response.data,
      url: fullUrl
    };
  } catch (error) {
    console.error('上传图片失败:', error);
    throw error;
  }
}; 