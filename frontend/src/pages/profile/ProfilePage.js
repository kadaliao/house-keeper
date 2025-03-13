import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Paper, 
  Box, 
  Avatar, 
  Grid, 
  TextField, 
  Button, 
  Divider, 
  CircularProgress,
  Card,
  CardContent,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  IconButton,
  useTheme
} from '@mui/material';
import { 
  Person as PersonIcon, 
  Edit as EditIcon, 
  Save as SaveIcon, 
  Lock as LockIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { updateUser } from '../../services/auth';
import { alpha } from '@mui/material/styles';

const ProfilePage = () => {
  const { currentUser, logout } = useAuth();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  
  // 表单数据
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    confirm_password: ''
  });
  
  // 表单验证错误
  const [formErrors, setFormErrors] = useState({});
  
  // 初始化表单数据
  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || '',
        email: currentUser.email || '',
        first_name: currentUser.first_name || '',
        last_name: currentUser.last_name || '',
        password: '',
        confirm_password: ''
      });
    }
  }, [currentUser]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // 清除相关字段的错误信息
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    // 基本信息验证
    if (tabValue === 0) {
      if (!formData.first_name.trim()) {
        errors.first_name = '请输入名字';
      }
      
      if (!formData.last_name.trim()) {
        errors.last_name = '请输入姓氏';
      }
      
      if (!formData.email.trim()) {
        errors.email = '请输入电子邮箱';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = '请输入有效的电子邮箱';
      }
    }
    
    // 密码验证
    if (tabValue === 1) {
      if (formData.password && formData.password.length < 6) {
        errors.password = '密码长度至少为6个字符';
      }
      
      if (formData.password !== formData.confirm_password) {
        errors.confirm_password = '两次输入的密码不一致';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // 根据当前标签页构建要更新的数据
      const updateData = tabValue === 0 
        ? { 
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email
          }
        : { password: formData.password };
      
      // 调用API更新用户信息
      await updateUser(updateData);
      
      setSuccess(true);
      setEditMode(false);
      
      // 如果更新了密码，清空密码字段
      if (tabValue === 1) {
        setFormData({
          ...formData,
          password: '',
          confirm_password: ''
        });
      }
    } catch (err) {
      console.error('更新个人资料失败:', err);
      setError(err.response?.data?.detail || '更新个人资料失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancelEdit = () => {
    // 取消编辑，恢复原始数据
    if (currentUser) {
      setFormData({
        username: currentUser.username || '',
        email: currentUser.email || '',
        first_name: currentUser.first_name || '',
        last_name: currentUser.last_name || '',
        password: '',
        confirm_password: ''
      });
    }
    setFormErrors({});
    setEditMode(false);
  };
  
  const handleCloseSnackbar = () => {
    setSuccess(false);
  };
  
  if (!currentUser) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  const fullName = `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() || currentUser.username;
  
  return (
    <Box>
      <Grid container spacing={3}>
        {/* 个人信息头部 */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.8)}, ${alpha(theme.palette.primary.dark, 0.8)})`,
              color: 'white',
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mr: 3,
                  bgcolor: 'white',
                  color: theme.palette.primary.main,
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }}
              >
                {currentUser?.first_name?.charAt(0) || currentUser?.username?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  {fullName}
                </Typography>
                <Typography variant="subtitle1">
                  {currentUser.email}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                  注册于 {new Date(currentUser.created_at).toLocaleDateString('zh-CN')}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* 个人资料表单 */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <CardContent>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
                  <Tab 
                    icon={<PersonIcon />} 
                    iconPosition="start" 
                    label="基本信息" 
                    id="profile-tab-0"
                    aria-controls="profile-tabpanel-0"
                  />
                  <Tab 
                    icon={<LockIcon />} 
                    iconPosition="start" 
                    label="修改密码" 
                    id="profile-tab-1"
                    aria-controls="profile-tabpanel-1"
                  />
                </Tabs>
              </Box>
              
              <Box
                component="form"
                onSubmit={handleSubmit}
                noValidate
                role="tabpanel"
                id="profile-tabpanel-0"
                aria-labelledby="profile-tab-0"
                hidden={tabValue !== 0}
              >
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h6">基本信息</Typography>
                      {!editMode ? (
                        <Button 
                          variant="outlined" 
                          startIcon={<EditIcon />} 
                          onClick={() => setEditMode(true)}
                        >
                          编辑信息
                        </Button>
                      ) : (
                        <Box>
                          <Button 
                            variant="outlined" 
                            color="error" 
                            startIcon={<CancelIcon />} 
                            onClick={handleCancelEdit}
                            sx={{ mr: 1 }}
                          >
                            取消
                          </Button>
                          <Button 
                            variant="contained" 
                            color="primary" 
                            startIcon={<SaveIcon />} 
                            type="submit"
                            disabled={loading}
                          >
                            {loading ? '保存中...' : '保存'}
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </Grid>
                
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="用户名"
                      name="username"
                      value={formData.username}
                      disabled
                      helperText="用户名不可修改"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="电子邮箱"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      error={!!formErrors.email}
                      helperText={formErrors.email}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="名字"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      error={!!formErrors.first_name}
                      helperText={formErrors.first_name}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="姓氏"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      error={!!formErrors.last_name}
                      helperText={formErrors.last_name}
                    />
                  </Grid>
                </Grid>
              </Box>
              
              <Box
                component="form"
                onSubmit={handleSubmit}
                noValidate
                role="tabpanel"
                id="profile-tabpanel-1"
                aria-labelledby="profile-tab-1"
                hidden={tabValue !== 1}
              >
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h6">修改密码</Typography>
                      {!editMode ? (
                        <Button 
                          variant="outlined" 
                          startIcon={<EditIcon />} 
                          onClick={() => setEditMode(true)}
                        >
                          修改密码
                        </Button>
                      ) : (
                        <Box>
                          <Button 
                            variant="outlined" 
                            color="error" 
                            startIcon={<CancelIcon />} 
                            onClick={handleCancelEdit}
                            sx={{ mr: 1 }}
                          >
                            取消
                          </Button>
                          <Button 
                            variant="contained" 
                            color="primary" 
                            startIcon={<SaveIcon />} 
                            type="submit"
                            disabled={loading}
                          >
                            {loading ? '保存中...' : '保存'}
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="新密码"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      error={!!formErrors.password}
                      helperText={formErrors.password || "请输入至少6位字符的新密码"}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="确认新密码"
                      name="confirm_password"
                      type="password"
                      value={formData.confirm_password}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      error={!!formErrors.confirm_password}
                      helperText={formErrors.confirm_password || "请再次输入新密码进行确认"}
                    />
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* 提示信息 */}
      <Snackbar 
        open={success} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          个人资料更新成功！
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={4000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfilePage; 