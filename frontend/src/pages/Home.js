import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          家庭物品管理系统
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          欢迎使用我们的系统
        </Typography>
        <Typography variant="body1" paragraph>
          这是一个帮助您管理家庭物品的应用，您可以追踪物品位置、设置提醒等。
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Button 
            component={Link} 
            to="/login" 
            variant="contained" 
            color="primary" 
            sx={{ mr: 2 }}
          >
            登录
          </Button>
          <Button 
            component={Link} 
            to="/register" 
            variant="outlined" 
            color="primary"
          >
            注册
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Home; 