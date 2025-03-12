import React from 'react';
import { Typography, Paper, Box, Avatar } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const ProfilePage = () => {
  const { currentUser } = useAuth();

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <Avatar sx={{ width: 64, height: 64, mr: 2 }}>
          {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
        </Avatar>
        <div>
          <Typography variant="h4" component="h1" gutterBottom>
            个人资料
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {currentUser?.username || '用户'}
          </Typography>
        </div>
      </Box>
      <Typography variant="body1">
        个人资料管理功能正在开发中...
      </Typography>
    </Paper>
  );
};

export default ProfilePage; 