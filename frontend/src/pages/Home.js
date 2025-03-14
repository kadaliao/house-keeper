import React, { useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  Grid, 
  Paper, 
  Card, 
  CardContent,
  useTheme,
  alpha,
  Stack
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Home as HomeIcon, 
  Inventory, 
  LocationOn, 
  Notifications, 
  Security
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const FeatureCard = ({ icon, title, description }) => {
  const theme = useTheme();
  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 16px 32px rgba(0,0,0,0.1)',
        }
      }}
    >
      <CardContent sx={{ p: 3, flexGrow: 1 }}>
        <Box 
          sx={{ 
            backgroundColor: alpha(theme.palette.primary.main, 0.1), 
            borderRadius: '50%', 
            width: 60, 
            height: 60, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            mb: 2
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" component="h3" gutterBottom fontWeight={600}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

const Home = () => {
  const theme = useTheme();
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  
  // 如果用户已登录，重定向到仪表盘
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, navigate]);
  
  // 如果正在加载身份验证状态，不渲染任何内容，避免闪烁
  if (loading) {
    return null;
  }
  
  const features = [
    {
      icon: <Inventory sx={{ fontSize: 30, color: theme.palette.primary.main }} />,
      title: "物品管理",
      description: "轻松记录和管理所有家庭物品，包括购买日期、保修期、价格和存放位置。"
    },
    {
      icon: <LocationOn sx={{ fontSize: 30, color: theme.palette.primary.main }} />,
      title: "位置跟踪",
      description: "创建家庭内部的位置层级结构，精确记录每件物品的存放位置，再也不会找不到东西。"
    },
    {
      icon: <Notifications sx={{ fontSize: 30, color: theme.palette.primary.main }} />,
      title: "智能提醒",
      description: "设置保修到期、食品过期、维护时间等提醒，确保您不会错过任何重要日期。"
    },
    {
      icon: <Security sx={{ fontSize: 30, color: theme.palette.primary.main }} />,
      title: "数据安全",
      description: "您的所有数据都经过安全加密存储，确保您的家庭信息安全可靠。"
    }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `linear-gradient(45deg, ${alpha(theme.palette.primary.light, 0.1)}, ${alpha(theme.palette.primary.main, 0.05)})`,
      pt: { xs: 4, md: 6 }
    }}>
      {/* Hero Section */}
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center" sx={{ mb: { xs: 6, md: 10 } }}>
          <Grid item xs={12} sx={{ textAlign: 'center' }}>
            <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 800, mx: 'auto' }}>
              <Typography 
                variant="h2" 
                component="h1" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 2,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                家庭物品管理系统
              </Typography>
              <Typography 
                variant="h5" 
                component="h2" 
                color="text.secondary" 
                sx={{ mb: 3, fontWeight: 500 }}
              >
                轻松管理家庭物品，告别杂乱无序
              </Typography>
              <Typography variant="body1" paragraph sx={{ mb: 4 }}>
                家庭物品管理系统帮助您追踪所有家庭物品的位置、保修期和重要提醒，让您的家庭管理更加井井有条。
              </Typography>
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button 
                  component={Link} 
                  to="/login" 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  sx={{ 
                    px: 4, 
                    py: 1.5, 
                    borderRadius: 2,
                    fontWeight: 600
                  }}
                >
                  立即登录
                </Button>
                <Button 
                  component={Link} 
                  to="/register" 
                  variant="outlined" 
                  color="primary"
                  size="large"
                  sx={{ 
                    px: 4, 
                    py: 1.5, 
                    borderRadius: 2,
                    fontWeight: 600 
                  }}
                >
                  新用户注册
                </Button>
              </Stack>
            </Box>
          </Grid>
        </Grid>

        {/* Features Section */}
        <Box sx={{ mb: { xs: 6, md: 10 } }}>
          <Typography 
            variant="h3" 
            component="h2" 
            textAlign="center" 
            sx={{ 
              fontWeight: 600, 
              mb: 1 
            }}
          >
            功能特色
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            textAlign="center" 
            sx={{ 
              mb: 6,
              maxWidth: 700,
              mx: 'auto'
            }}
          >
            我们的系统提供多种实用功能，帮助您更有效地管理家庭物品
          </Typography>
          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <FeatureCard 
                  icon={feature.icon} 
                  title={feature.title} 
                  description={feature.description} 
                />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Get Started Section */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 3, md: 6 }, 
            borderRadius: 3, 
            textAlign: 'center',
            background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.9)}, ${alpha(theme.palette.primary.dark, 0.9)})`,
            mb: 6
          }}
        >
          <Typography variant="h4" component="h2" color="white" gutterBottom sx={{ fontWeight: 600 }}>
            准备开始整理您的家庭物品了吗？
          </Typography>
          <Typography variant="body1" color="white" paragraph sx={{ mb: 4, maxWidth: 700, mx: 'auto' }}>
            立即注册并开始使用我们的系统，让您的家庭物品管理变得简单高效。
          </Typography>
          <Button 
            component={Link} 
            to="/register" 
            variant="contained" 
            color="secondary" 
            size="large"
            sx={{ 
              px: 4, 
              py: 1.5, 
              borderRadius: 2,
              fontWeight: 600 
            }}
          >
            免费注册
          </Button>
        </Paper>
        
        {/* Footer */}
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} 家庭物品管理系统 — 保留所有权利
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Home; 