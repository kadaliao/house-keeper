import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Paper, 
  Box, 
  Button, 
  Grid, 
  TextField, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Select, 
  Card, 
  CardContent, 
  CardActions, 
  Chip,
  Divider,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Badge
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Inventory as InventoryIcon,
  Repeat as RepeatIcon,
  AccessTime as AccessTimeIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { format, isAfter, isBefore, addDays } from 'date-fns';

import { getReminders, createReminder, updateReminder, deleteReminder } from '../../services/reminders';
import { getItems } from '../../services/items';
import { useReminders as useRemindersContext } from '../../contexts/ReminderContext';

const RepeatTypes = {
  NONE: 'none',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly'
};

const RepeatTypeLabels = {
  [RepeatTypes.NONE]: '不重复',
  [RepeatTypes.DAILY]: '每天',
  [RepeatTypes.WEEKLY]: '每周',
  [RepeatTypes.MONTHLY]: '每月',
  [RepeatTypes.YEARLY]: '每年'
};

const RemindersPage = () => {
  const [reminders, setReminders] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const { fetchReminders: refreshGlobalReminders } = useRemindersContext();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // 默认为明天
    repeat_type: RepeatTypes.NONE,
    is_completed: false,
    item_id: ''
  });

  // 将fetchData函数提取到组件顶层作用域
  const fetchData = async () => {
    try {
      setLoading(true);
      const [remindersData, itemsData] = await Promise.all([
        getReminders(),
        getItems()
      ]);
      setReminders(remindersData);
      setItems(itemsData);
      setError(null);
    } catch (err) {
      console.error('获取数据失败:', err);
      setError('获取数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 获取所有提醒和物品
  useEffect(() => {
    fetchData();
  }, []);

  // 处理表单输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // 处理开关变化
  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  // 处理日期时间变化
  const handleDateTimeChange = (date) => {
    setFormData({
      ...formData,
      due_date: date
    });
  };

  // 打开添加提醒对话框
  const handleOpenAddDialog = (itemId = '') => {
    setEditingReminder(null);
    setFormData({
      title: '',
      description: '',
      due_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // 默认为明天
      repeat_type: RepeatTypes.NONE,
      is_completed: false,
      item_id: itemId
    });
    setOpenDialog(true);
  };

  // 打开编辑提醒对话框
  const handleOpenEditDialog = (reminder) => {
    setEditingReminder(reminder);
    setFormData({
      title: reminder.title,
      description: reminder.description || '',
      due_date: reminder.due_date ? new Date(reminder.due_date) : new Date(),
      repeat_type: reminder.repeat_type || RepeatTypes.NONE,
      is_completed: reminder.is_completed || false,
      item_id: reminder.item_id || ''
    });
    setOpenDialog(true);
  };

  // 关闭对话框
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // 保存提醒
  const handleSaveReminder = async () => {
    try {
      setLoading(true);
      
      // 验证必填字段
      if (!formData.title) {
        setSnackbar({
          open: true,
          message: '提醒标题不能为空',
          severity: 'error'
        });
        setLoading(false);
        return;
      }

      const reminderData = {
        ...formData,
        item_id: formData.item_id || null
      };

      let savedReminder;
      
      if (editingReminder) {
        // 更新提醒
        savedReminder = await updateReminder(editingReminder.id, reminderData);
        setSnackbar({
          open: true,
          message: '提醒更新成功',
          severity: 'success'
        });
      } else {
        // 创建新提醒
        savedReminder = await createReminder(reminderData);
        setSnackbar({
          open: true,
          message: '提醒添加成功',
          severity: 'success'
        });
      }

      // 更新提醒列表
      setReminders(prevReminders => {
        if (editingReminder) {
          return prevReminders.map(reminder => 
            reminder.id === editingReminder.id ? savedReminder : reminder
          );
        } else {
          return [...prevReminders, savedReminder];
        }
      });

      handleCloseDialog();
      
      // 重置表单
      setFormData({
        title: '',
        description: '',
        due_date: new Date(Date.now() + 24 * 60 * 60 * 1000),
        repeat_type: RepeatTypes.NONE,
        is_completed: false,
        item_id: ''
      });
      
      // 刷新提醒列表
      fetchData();
      
      // 刷新全局提醒状态
      refreshGlobalReminders();
    } catch (err) {
      console.error('Failed to save reminder:', err);
      setSnackbar({
        open: true,
        message: `保存提醒失败: ${err.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // 删除提醒
  const handleDeleteReminder = async (id) => {
    if (window.confirm('确定要删除这个提醒吗？')) {
      try {
        setLoading(true);
        await deleteReminder(id);
        
        // 更新提醒列表
        setReminders(prevReminders => prevReminders.filter(reminder => reminder.id !== id));
        
        setSnackbar({
          open: true,
          message: '提醒删除成功',
          severity: 'success'
        });
        
        // 刷新全局提醒状态
        refreshGlobalReminders();
      } catch (err) {
        console.error('Failed to delete reminder:', err);
        setSnackbar({
          open: true,
          message: `删除提醒失败: ${err.message}`,
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // 切换提醒完成状态
  const handleToggleComplete = async (reminder) => {
    try {
      const updatedReminder = { ...reminder, is_completed: !reminder.is_completed };
      await updateReminder(reminder.id, updatedReminder);
      
      // 更新本地状态
      setReminders(reminders.map(r => 
        r.id === reminder.id ? { ...r, is_completed: !r.is_completed } : r
      ));
      
      setSnackbar({
        open: true,
        message: updatedReminder.is_completed ? '提醒已标记为完成' : '提醒已标记为未完成',
        severity: 'success'
      });
      
      // 刷新全局提醒状态
      refreshGlobalReminders();
    } catch (err) {
      console.error('Failed to update reminder completion status:', err);
      setSnackbar({
        open: true,
        message: `更新提醒状态失败: ${err.message}`,
        severity: 'error'
      });
    }
  };

  // 关闭提示框
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // 处理标签切换
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // 获取物品名称
  const getItemName = (itemId) => {
    const item = items.find(item => item.id === itemId);
    return item ? item.name : '';
  };

  // 过滤提醒
  const getFilteredReminders = () => {
    const now = new Date();
    
    switch (tabValue) {
      case 0: // 全部
        return reminders;
      case 1: // 未完成
        return reminders.filter(reminder => !reminder.is_completed);
      case 2: // 已完成
        return reminders.filter(reminder => reminder.is_completed);
      case 3: // 今日到期
        return reminders.filter(reminder => {
          const dueDate = new Date(reminder.due_date);
          return dueDate.getDate() === now.getDate() && 
                 dueDate.getMonth() === now.getMonth() && 
                 dueDate.getFullYear() === now.getFullYear();
        });
      case 4: // 即将到期
        return reminders.filter(reminder => {
          const dueDate = new Date(reminder.due_date);
          const nextWeek = addDays(now, 7);
          return !reminder.is_completed && 
                 isAfter(dueDate, now) && 
                 isBefore(dueDate, nextWeek);
        });
      default:
        return reminders;
    }
  };

  // 获取未完成提醒数量
  const getIncompleteCount = () => {
    return reminders.filter(reminder => !reminder.is_completed).length;
  };

  // 获取今日到期提醒数量
  const getTodayCount = () => {
    const now = new Date();
    return reminders.filter(reminder => {
      const dueDate = new Date(reminder.due_date);
      return dueDate.getDate() === now.getDate() && 
             dueDate.getMonth() === now.getMonth() && 
             dueDate.getFullYear() === now.getFullYear();
    }).length;
  };

  // 获取即将到期提醒数量
  const getUpcomingCount = () => {
    const now = new Date();
    const nextWeek = addDays(now, 7);
    return reminders.filter(reminder => {
      const dueDate = new Date(reminder.due_date);
      return !reminder.is_completed && 
             isAfter(dueDate, now) && 
             isBefore(dueDate, nextWeek);
    }).length;
  };

  // 渲染提醒卡片
  const renderReminderCard = (reminder) => {
    const dueDate = new Date(reminder.due_date);
    const isOverdue = isBefore(dueDate, new Date()) && !reminder.is_completed;
    
    return (
      <Card 
        key={reminder.id} 
        sx={{ 
          mb: 2,
          borderLeft: 4,
          borderColor: isOverdue 
            ? 'error.main' 
            : reminder.is_completed 
              ? 'success.main' 
              : 'primary.main',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          }
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography 
              variant="h6" 
              component="h3" 
              sx={{ 
                textDecoration: reminder.is_completed ? 'line-through' : 'none',
                color: reminder.is_completed ? 'text.secondary' : 'text.primary'
              }}
            >
              {reminder.title}
            </Typography>
            {reminder.repeat_type !== RepeatTypes.NONE && (
              <Tooltip title={RepeatTypeLabels[reminder.repeat_type]}>
                <Chip 
                  icon={<RepeatIcon />} 
                  label={RepeatTypeLabels[reminder.repeat_type]} 
                  size="small" 
                  color="secondary" 
                  variant="outlined" 
                />
              </Tooltip>
            )}
          </Box>
          
          {reminder.description && (
            <Typography 
              variant="body2" 
              color="textSecondary" 
              sx={{ 
                mb: 2,
                textDecoration: reminder.is_completed ? 'line-through' : 'none'
              }}
            >
              {reminder.description}
            </Typography>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <AccessTimeIcon fontSize="small" color="action" sx={{ mr: 1 }} />
            <Typography 
              variant="body2" 
              color={isOverdue ? 'error' : 'textSecondary'}
              fontWeight={isOverdue ? 'bold' : 'normal'}
            >
              {format(dueDate, 'yyyy-MM-dd HH:mm')}
              {isOverdue && ' (已过期)'}
            </Typography>
          </Box>
          
          {reminder.item_id && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <InventoryIcon fontSize="small" color="action" sx={{ mr: 1 }} />
              <Typography variant="body2" color="textSecondary">
                关联物品: {getItemName(reminder.item_id)}
              </Typography>
            </Box>
          )}
        </CardContent>
        <CardActions>
          <Tooltip title={reminder.is_completed ? "标记为未完成" : "标记为完成"}>
            <IconButton 
              size="small" 
              color={reminder.is_completed ? "success" : "default"}
              onClick={() => handleToggleComplete(reminder)}
            >
              <CheckCircleIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="编辑">
            <IconButton 
              size="small" 
              color="primary"
              onClick={() => handleOpenEditDialog(reminder)}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="删除">
            <IconButton 
              size="small" 
              color="error"
              onClick={() => handleDeleteReminder(reminder.id)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>
    );
  };

  const filteredReminders = getFilteredReminders();

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          提醒管理
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
          在这里管理您的提醒事项
        </Typography>
        
        {/* 添加提醒按钮 */}
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenAddDialog()}
          >
            添加提醒
          </Button>
        </Box>

        {/* 错误提示 */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* 标签页 */}
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="全部" />
          <Tab 
            label={
              <Badge badgeContent={getIncompleteCount()} color="primary">
                未完成
              </Badge>
            } 
          />
          <Tab label="已完成" />
          <Tab 
            label={
              <Badge badgeContent={getTodayCount()} color="secondary">
                今日到期
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={getUpcomingCount()} color="info">
                即将到期
              </Badge>
            } 
          />
        </Tabs>

        {/* 提醒列表 */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredReminders.length === 0 ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            暂无{tabValue === 0 ? '' : ['', '未完成', '已完成', '今日到期', '即将到期'][tabValue]}提醒数据
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {filteredReminders.map(reminder => (
              <Grid item xs={12} sm={6} md={4} key={reminder.id}>
                {renderReminderCard(reminder)}
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* 添加/编辑提醒对话框 */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingReminder ? '编辑提醒' : '添加提醒'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="提醒标题"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="描述"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={3}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DateTimePicker
                label="到期时间"
                value={formData.due_date}
                onChange={handleDateTimeChange}
                renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                format="yyyy-MM-dd HH:mm"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="repeat-type-label">重复类型</InputLabel>
                <Select
                  labelId="repeat-type-label"
                  name="repeat_type"
                  value={formData.repeat_type}
                  onChange={handleInputChange}
                  label="重复类型"
                >
                  {Object.entries(RepeatTypeLabels).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="item-select-label">关联物品</InputLabel>
                <Select
                  labelId="item-select-label"
                  name="item_id"
                  value={formData.item_id}
                  onChange={handleInputChange}
                  label="关联物品"
                >
                  <MenuItem value="">
                    <em>无</em>
                  </MenuItem>
                  {items.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_completed}
                    onChange={handleSwitchChange}
                    name="is_completed"
                    color="primary"
                  />
                }
                label="已完成"
                sx={{ mt: 3 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            取消
          </Button>
          <Button 
            onClick={handleSaveReminder} 
            color="primary" 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : '保存'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 提示框 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default RemindersPage; 