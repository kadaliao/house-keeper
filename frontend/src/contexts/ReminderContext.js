import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDueReminders, getUpcomingReminders } from '../services/reminders';

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
      setError('获取提醒数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始化时加载数据
  useEffect(() => {
    fetchReminders();
    
    // 设置定期刷新（每小时刷新一次）
    const intervalId = setInterval(fetchReminders, 60 * 60 * 1000);
    
    // 清理函数
    return () => clearInterval(intervalId);
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