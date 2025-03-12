import React from 'react';
import { Typography, Paper, Box } from '@mui/material';

const RemindersPage = () => {
  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          提醒管理
        </Typography>
        <Typography variant="body1" color="textSecondary">
          在这里管理您的提醒事项
        </Typography>
      </Box>
      <Typography variant="body1">
        提醒管理功能正在开发中...
      </Typography>
    </Paper>
  );
};

export default RemindersPage; 