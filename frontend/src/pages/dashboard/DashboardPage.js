import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  Card,
  CardContent,
  CircularProgress,
  CardHeader,
  IconButton,
  alpha,
  useTheme,
  Chip,
  Button,
  Avatar,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart, 
  Area,
} from 'recharts';
import { 
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Inventory as InventoryIcon,
  LocationOn as LocationIcon, 
  Notifications as NotificationsIcon,
  AccessTime as AccessTimeIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { getItems } from '../../services/items';
import { getLocations } from '../../services/locations';
import { getDueReminders, getUpcomingReminders } from '../../services/reminders';
import { getDashboardStats } from '../../services/stats';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

// 颜色常量，添加透明度变化
const getColors = (theme) => [
  theme.palette.primary.main,
  theme.palette.secondary.main,
  theme.palette.success.main,
  theme.palette.warning.main,
  theme.palette.info.main,
  theme.palette.error.main,
];

// 数据卡片组件
const StatCard = ({ title, value, icon, color, trend, trendValue, subtitle }) => {
  const theme = useTheme();
  const IconComponent = icon;

  return (
    <Card 
      sx={{ 
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
        }
      }}
    >
      <Box 
        sx={{ 
          position: 'absolute', 
          top: -20, 
          right: -20, 
          width: 120, 
          height: 120, 
          borderRadius: '50%', 
          background: alpha(color, 0.1),
          zIndex: 0
        }} 
      />
      <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography color="textSecondary" variant="subtitle2" fontWeight={500}>
            {title}
          </Typography>
          <Avatar 
            sx={{ 
              backgroundColor: alpha(color, 0.1), 
              color: color,
              width: 40, 
              height: 40 
            }}
          >
            <IconComponent />
          </Avatar>
        </Box>
        
        <Typography variant="h3" component="div" fontWeight={600} sx={{ mb: 1 }}>
          {value}
        </Typography>

        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip
              size="small"
              icon={trend === 'up' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />}
              label={`${trendValue}%`}
              color={trend === 'up' ? 'success' : 'error'}
              sx={{ borderRadius: 1, height: 24 }}
            />
            <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
              {subtitle || '相比上周'}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// 提醒列表组件
const ReminderList = ({ title, items, emptyText, icon, color }) => {
  const theme = useTheme();
  const IconComponent = icon;

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ backgroundColor: alpha(color, 0.1), color: color, mr: 1.5, width: 32, height: 32 }}>
              <IconComponent fontSize="small" />
            </Avatar>
            <Typography variant="h6">{title}</Typography>
          </Box>
        }
        action={
          <Tooltip title="刷新">
            <IconButton size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        }
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ pt: 2, pb: 1, px: 2, height: 250, overflow: 'auto' }}>
        {items.length > 0 ? (
          <List disablePadding>
            {items.map((reminder) => (
              <React.Fragment key={reminder.id}>
                <ListItem 
                  alignItems="flex-start" 
                  sx={{ 
                    px: 2, 
                    py: 1.5, 
                    borderRadius: 1,
                    mb: 1,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        mr: 1.5, 
                        backgroundColor: 
                          reminder.priority === 'high' 
                            ? alpha(theme.palette.error.main, 0.1) 
                            : alpha(theme.palette.warning.main, 0.1),
                        color: 
                          reminder.priority === 'high' 
                            ? theme.palette.error.main 
                            : theme.palette.warning.main,
                      }}
                    >
                      <WarningIcon fontSize="small" />
                    </Avatar>
                    
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {reminder.title}
                        </Typography>
                        <Chip 
                          label={format(new Date(reminder.due_date), 'MM-dd')} 
                          size="small" 
                          sx={{
                            height: 20,
                            fontSize: '0.7rem',
                            fontWeight: 500,
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                          }}
                        />
                      </Box>
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                        {reminder.description || '无描述信息'}
                      </Typography>
                    </Box>
                  </Box>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center', 
              alignItems: 'center',
              p: 2,
            }}
          >
            <Avatar 
              sx={{ 
                width: 40, 
                height: 40, 
                mb: 1, 
                backgroundColor: alpha(theme.palette.success.main, 0.1),
                color: theme.palette.success.main,
              }}
            >
              <CheckIcon />
            </Avatar>
            <Typography variant="body2" color="textSecondary" textAlign="center">
              {emptyText}
            </Typography>
          </Box>
        )}
      </CardContent>
      <Box sx={{ px: 2, pb: 2 }}>
        <Button 
          variant="outlined" 
          size="small" 
          fullWidth
          sx={{ borderRadius: 1 }}
        >
          查看全部
        </Button>
      </Box>
    </Card>
  );
};

// 图表卡片组件
const ChartCard = ({ title, children, icon, color }) => {
  const theme = useTheme();
  const IconComponent = icon;

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ backgroundColor: alpha(color, 0.1), color: color, mr: 1.5, width: 32, height: 32 }}>
              <IconComponent fontSize="small" />
            </Avatar>
            <Typography variant="h6">{title}</Typography>
          </Box>
        }
        action={
          <IconButton size="small">
            <MoreVertIcon />
          </IconButton>
        }
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ height: 250 }}>
        {children}
      </CardContent>
    </Card>
  );
};

const DashboardPage = () => {
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [dueReminders, setDueReminders] = useState([]);
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const colors = getColors(theme);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dueRemindersData, upcomingRemindersData, statsData] = await Promise.all([
          getDueReminders(),
          getUpcomingReminders(),
          getDashboardStats()
        ]);
        
        setDueReminders(dueRemindersData);
        setUpcomingReminders(upcomingRemindersData);
        setDashboardStats(statsData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('加载数据失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 自定义图表工具提示
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper
          elevation={3}
          sx={{
            p: 1.5,
            borderRadius: 1,
            boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Box key={`item-${index}`} sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: entry.color,
                  mr: 1,
                }}
              />
              <Typography variant="body2">
                {entry.name}: {entry.value}
              </Typography>
            </Box>
          ))}
        </Paper>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        justifyContent="center" 
        alignItems="center" 
        sx={{ 
          minHeight: 'calc(100vh - 120px)',
          p: 3, 
        }}
      >
        <CircularProgress size={60} thickness={4} sx={{ mb: 2 }} />
        <Typography variant="h6" color="textSecondary">
          加载仪表盘数据...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        sx={{ 
          minHeight: 'calc(100vh - 120px)',
          p: 3,
        }}
      >
        <Typography color="error" variant="h6" sx={{ mb: 2 }}>
          {error}
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => window.location.reload()}
          startIcon={<RefreshIcon />}
        >
          重新加载
        </Button>
      </Box>
    );
  }

  // 定义默认空数据
  const defaultStats = {
    counts: {
      items: 0,
      locations: 0,
      due_reminders: 0,
      upcoming_reminders: 0
    },
    category_distribution: [],
    location_stats: []
  };

  // 使用统计数据或默认值
  const stats = dashboardStats || defaultStats;
  const categoryData = stats.category_distribution || [];
  const locationData = stats.location_stats || [];

  // 准备趋势数据（模拟数据）
  const prepareTrendData = () => {
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    return days.map((day, index) => ({
      name: day,
      物品: 10 + Math.floor(Math.random() * 30),
      提醒: 5 + Math.floor(Math.random() * 15),
    }));
  };

  const trendData = prepareTrendData();

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={600}>
            仪表盘
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {format(new Date(), 'yyyy年MM月dd日 EEEE', { locale: zhCN })} · 欢迎回来
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />}
          onClick={() => window.location.reload()}
        >
          刷新数据
        </Button>
      </Box>

      {/* 统计卡片区域 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="物品总数" 
            value={stats.counts.items} 
            icon={InventoryIcon}
            color={theme.palette.primary.main}
            trend="up"
            trendValue={5}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="位置总数" 
            value={stats.counts.locations} 
            icon={LocationIcon}
            color={theme.palette.secondary.main}
            trend="up"
            trendValue={12}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="已过期提醒" 
            value={stats.counts.due_reminders} 
            icon={NotificationsIcon}
            color={theme.palette.error.main}
            trend="down"
            trendValue={8}
            subtitle="比上周减少"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="即将到期提醒" 
            value={stats.counts.upcoming_reminders} 
            icon={AccessTimeIcon}
            color={theme.palette.warning.main}
            trend="up"
            trendValue={15}
          />
        </Grid>
      </Grid>

      {/* 图表区域 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <ChartCard 
            title="本周趋势" 
            icon={InventoryIcon}
            color={theme.palette.primary.main}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trendData}
                margin={{
                  top: 20,
                  right: 20,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
                <YAxis stroke={theme.palette.text.secondary} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="物品" 
                  stackId="1"
                  stroke={theme.palette.primary.main}
                  fill={alpha(theme.palette.primary.main, 0.1)}
                />
                <Area 
                  type="monotone" 
                  dataKey="提醒" 
                  stackId="1"
                  stroke={theme.palette.secondary.main}
                  fill={alpha(theme.palette.secondary.main, 0.1)}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <ChartCard 
            title="物品分类" 
            icon={InventoryIcon}
            color={theme.palette.secondary.main}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill={theme.palette.primary.main}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={colors[index % colors.length]} 
                    />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <ChartCard 
            title="热门位置" 
            icon={LocationIcon}
            color={theme.palette.info.main}
          >
            {locationData && locationData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={locationData}
                  layout="vertical"
                  margin={{
                    top: 20,
                    right: 20,
                    left: 40,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={alpha(theme.palette.divider, 0.3)} />
                  <XAxis type="number" stroke={theme.palette.text.secondary} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    scale="band" 
                    stroke={theme.palette.text.secondary}
                    tickLine={false}
                    style={{
                      fontSize: '0.75rem',
                    }}
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="count" 
                    name="物品数量" 
                    fill={alpha(theme.palette.info.main, 0.8)}
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                    onClick={(data) => {
                      // 如果数据包含id，导航到位置详情页面
                      if (data && data.id) {
                        window.location.href = `/locations?selected=${data.id}`;
                      }
                    }}
                  >
                    {locationData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={alpha(theme.palette.info.main, 0.7 - (index * 0.1))}
                        style={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  p: 3
                }}
              >
                <Typography variant="body1" color="textSecondary" sx={{ mb: 2, textAlign: 'center' }}>
                  暂无位置数据或未添加物品到位置中
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small" 
                  color="info"
                  startIcon={<LocationIcon />}
                  onClick={() => window.location.href = '/locations'}
                >
                  前往管理位置
                </Button>
              </Box>
            )}
          </ChartCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3.5}>
          <ReminderList 
            title="已过期提醒" 
            items={dueReminders} 
            emptyText="没有已过期的提醒"
            icon={NotificationsIcon}
            color={theme.palette.error.main}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3.5}>
          <ReminderList 
            title="即将到期提醒" 
            items={upcomingReminders} 
            emptyText="没有即将到期的提醒"
            icon={AccessTimeIcon}
            color={theme.palette.warning.main}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage; 