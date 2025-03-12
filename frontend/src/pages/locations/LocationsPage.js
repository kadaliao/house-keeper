import React from 'react';
import { Typography, Paper, Box } from '@mui/material';

const LocationsPage = () => {
  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          位置管理
        </Typography>
        <Typography variant="body1" color="textSecondary">
          在这里管理您的存储位置
        </Typography>
      </Box>
      <Typography variant="body1">
        位置管理功能正在开发中...
      </Typography>
    </Paper>
  );
};

export default LocationsPage; 