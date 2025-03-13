import api from './api';

/**
 * 获取仪表盘统计数据
 * 
 * @returns {Promise<Object>} 包含以下字段的对象:
 *   - counts: 各种计数，包括物品总数、位置总数、已过期提醒数、即将到期提醒数
 *   - category_distribution: 物品分类分布统计
 *   - location_stats: 热门位置统计（物品数量最多的位置）
 */
export const getDashboardStats = async () => {
  try {
    const response = await api.get('/stats/dashboard');
    return response.data;
  } catch (error) {
    console.error('获取仪表盘统计数据失败:', error);
    throw error;
  }
};

/**
 * 获取物品分类分布
 * 
 * @returns {Promise<Array>} 物品分类分布数组
 */
export const getCategoryDistribution = async () => {
  try {
    const stats = await getDashboardStats();
    return stats.category_distribution || [];
  } catch (error) {
    console.error('获取物品分类分布失败:', error);
    throw error;
  }
};

/**
 * 获取热门位置统计
 * 
 * @returns {Promise<Array>} 热门位置统计数组
 */
export const getLocationStats = async () => {
  try {
    const stats = await getDashboardStats();
    return stats.location_stats || [];
  } catch (error) {
    console.error('获取热门位置统计失败:', error);
    throw error;
  }
};

/**
 * 直接获取热门位置统计
 * 
 * @param {number} limit - 返回结果数量限制，默认为5
 * @returns {Promise<Array>} 热门位置统计数组，包含id、name和count字段
 */
export const getPopularLocations = async (limit = 5) => {
  try {
    const response = await api.get('/stats/popular-locations', { params: { limit } });
    return response.data;
  } catch (error) {
    console.error('获取热门位置统计失败:', error);
    throw error;
  }
}; 