import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCurrentUser, login as loginApi, logout as logoutApi, isAuthenticated } from '../services/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      console.log('AuthContext 初始化中...');
      console.log('是否已认证:', isAuthenticated());
      
      if (isAuthenticated()) {
        try {
          console.log('尝试获取当前用户信息...');
          const user = await getCurrentUser();
          console.log('获取用户信息成功:', user);
          setCurrentUser(user);
        } catch (err) {
          console.error('获取当前用户信息失败:', err);
          logoutApi();
        }
      }
      setLoading(false);
      console.log('AuthContext 初始化完成');
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    setError(null);
    try {
      console.log('尝试登录...');
      const success = await loginApi(username, password);
      console.log('登录结果:', success);
      if (success) {
        console.log('登录成功，获取用户信息...');
        const user = await getCurrentUser();
        console.log('获取用户信息成功:', user);
        setCurrentUser(user);
        return true;
      }
      return false;
    } catch (err) {
      console.error('登录失败:', err);
      setError(err.response?.data?.detail || 'Login failed');
      return false;
    }
  };

  const logout = () => {
    console.log('执行登出操作...');
    logoutApi();
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!currentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 