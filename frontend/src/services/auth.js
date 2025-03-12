import api from './api';
import qs from 'qs';

export const login = async (username, password) => {
  try {
    // 使用qs库格式化表单数据
    const data = qs.stringify({
      username,
      password,
    });
    
    console.log('准备发送登录请求:', { username });
    
    const response = await api.post('/auth/login', data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    console.log('登录响应:', response.data);
    
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('登录请求失败:', error);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    console.log('获取当前用户信息...');
    const response = await api.get('/auth/me');
    console.log('获取用户信息响应:', response.data);
    return response.data;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    throw error;
  }
};

export const updateUser = async (userData) => {
  const response = await api.put('/auth/me', userData);
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
}; 