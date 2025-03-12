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
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getItems } from '../../services/items';
import { getLocations } from '../../services/locations';
import { getDueReminders, getUpcomingReminders } from '../../services/reminders';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const DashboardPage = () => {
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [dueReminders, setDueReminders] = useState([]);
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [itemsData, locationsData, dueRemindersData, upcomingRemindersData] = await Promise.all([
          getItems(),
          getLocations(),
          getDueReminders(),
          getUpcomingReminders(),
        ]);
        setItems(itemsData);
        setLocations(locationsData);
        setDueReminders(dueRemindersData);
        setUpcomingReminders(upcomingRemindersData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('加载数据失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Prepare data for charts
  const prepareCategoryData = () => {
    const categories = {};
    items.forEach((item) => {
      const category = item.category || '未分类';
      categories[category] = (categories[category] || 0) + 1;
    });

    return Object.keys(categories).map((key) => ({
      name: key,
      value: categories[key],
    }));
  };

  const prepareLocationData = () => {
    const locationCounts = {};
    items.forEach((item) => {
      if (item.location_id) {
        locationCounts[item.location_id] = (locationCounts[item.location_id] || 0) + 1;
      }
    });

    return locations
      .filter((location) => locationCounts[location.id])
      .map((location) => ({
        name: location.name,
        count: locationCounts[location.id] || 0,
      }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const categoryData = prepareCategoryData();
  const locationData = prepareLocationData();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          仪表盘
        </Typography>
      </Grid>

      {/* Summary Cards */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              物品总数
            </Typography>
            <Typography variant="h3">{items.length}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              位置总数
            </Typography>
            <Typography variant="h3">{locations.length}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              已过期提醒
            </Typography>
            <Typography variant="h3">{dueReminders.length}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              即将到期提醒
            </Typography>
            <Typography variant="h3">{upcomingReminders.length}</Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Charts */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, height: 300 }}>
          <Typography variant="h6" gutterBottom>
            物品分类分布
          </Typography>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, height: 300 }}>
          <Typography variant="h6" gutterBottom>
            位置物品分布
          </Typography>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart
              data={locationData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="物品数量" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Reminders */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, height: 300, overflow: 'auto' }}>
          <Typography variant="h6" gutterBottom>
            已过期提醒
          </Typography>
          {dueReminders.length > 0 ? (
            <List>
              {dueReminders.map((reminder) => (
                <React.Fragment key={reminder.id}>
                  <ListItem>
                    <ListItemText
                      primary={reminder.title}
                      secondary={new Date(reminder.due_date).toLocaleString()}
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              没有已过期的提醒
            </Typography>
          )}
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, height: 300, overflow: 'auto' }}>
          <Typography variant="h6" gutterBottom>
            即将到期提醒
          </Typography>
          {upcomingReminders.length > 0 ? (
            <List>
              {upcomingReminders.map((reminder) => (
                <React.Fragment key={reminder.id}>
                  <ListItem>
                    <ListItemText
                      primary={reminder.title}
                      secondary={new Date(reminder.due_date).toLocaleString()}
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              没有即将到期的提醒
            </Typography>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default DashboardPage; 