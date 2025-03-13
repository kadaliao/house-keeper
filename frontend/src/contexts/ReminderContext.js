import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDueReminders, getUpcomingReminders } from '../services/reminders';
import { isAuthenticated } from '../services/auth';

// 创建上下文
const ReminderContext = createContext();

// 提供使用上下文的钩子
export function useReminders() {
  return useContext(ReminderContext);
}

// 提供者组件
export function ReminderProvider({ children }) {
  const [dueReminders, setDueReminders] = useState([]);
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 获取提醒数据
  const fetchReminders = async () => {
    // 检查用户是否已认证，未认证时不获取数据
    if (!isAuthenticated()) {
      console.log('用户未认证，跳过获取提醒数据');
      setDueReminders([]);
      setUpcomingReminders([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const [dueData, upcomingData] = await Promise.all([
        getDueReminders(),
        getUpcomingReminders(7) // 获取未来7天的提醒
      ]);
      
      setDueReminders(dueData);
      setUpcomingReminders(upcomingData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch reminders:', err);
      
      // 检查是否是401错误（未认证）
      if (err.response && err.response.status === 401) {
        console.log('用户认证已过期，清空提醒数据');
        setDueReminders([]);
        setUpcomingReminders([]);
      } else {
        setError('获取提醒数据失败');
      }
    } finally {
      setLoading(false);
    }
  };

  // 监听认证状态变化和初始化时加载数据
  useEffect(() => {
    // 当组件挂载或认证状态变化时获取数据
    fetchReminders();
    
    // 设置定期刷新（每小时刷新一次）
    const intervalId = setInterval(() => {
      // 每次刷新前检查认证状态
      if (isAuthenticated()) {
        fetchReminders();
      }
    }, 60 * 60 * 1000);
    
    // 监听存储事件，用于检测登出操作
    const handleStorageChange = (e) => {
      if (e.key === 'token' && !e.newValue) {
        // token被移除，用户已登出
        console.log('检测到用户登出（storage事件），清空提醒数据');
        setDueReminders([]);
        setUpcomingReminders([]);
      }
    };
    
    // 监听自定义登出事件
    const handleLogout = () => {
      console.log('检测到用户登出（自定义事件），清空提醒数据');
      setDueReminders([]);
      setUpcomingReminders([]);
      setLoading(false);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('user-logout', handleLogout);
    
    // 清理函数
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('user-logout', handleLogout);
    };
  }, []);

  // 获取总提醒数（到期+即将到期）
  const getTotalCount = () => {
    return dueReminders.length + upcomingReminders.length;
  };

  // 获取到期提醒数
  const getDueCount = () => {
    return dueReminders.length;
  };

  // 获取即将到期提醒数
  const getUpcomingCount = () => {
    return upcomingReminders.length;
  };

  // 上下文值
  const value = {
    dueReminders,
    upcomingReminders,
    loading,
    error,
    fetchReminders,
    getTotalCount,
    getDueCount,
    getUpcomingCount
  };

  return (
    <ReminderContext.Provider value={value}>
      {children}
    </ReminderContext.Provider>
  );
} 