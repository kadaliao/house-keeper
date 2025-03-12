import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  alpha,
  Badge,
  Tooltip,
  Button,
  Chip,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  LocationOn as LocationIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  AccountCircle,
  Logout,
  Person as PersonIcon,
  Search as SearchIcon,
  Help as HelpIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 260;

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { text: '仪表盘', icon: <DashboardIcon />, path: '/dashboard' },
    { text: '物品', icon: <InventoryIcon />, path: '/items' },
    { text: '位置', icon: <LocationIcon />, path: '/locations' },
    { text: '提醒', icon: <NotificationsIcon />, path: '/reminders', notificationCount: 2 },
    { text: '设置', icon: <SettingsIcon />, path: '/settings' },
  ];

  const getPageTitle = () => {
    const currentPath = location.pathname;
    const currentItem = menuItems.find(item => item.path === currentPath);
    return currentItem?.text || '家庭物品管理系统';
  };

  const drawer = (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.background.paper, 1)} 30%)` 
    }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            src="/logo.png" 
            alt="Logo"
            sx={{ 
              width: 36, 
              height: 36, 
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              mr: 1.5,
              color: theme.palette.primary.main
            }}
          >
            H
          </Avatar>
          <Typography variant="h6" component="div" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
            House Keeper
          </Typography>
        </Box>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>
      
      <Divider sx={{ mb: 2 }} />

      {currentUser && (
        <Box sx={{ px: 2, mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 1.5,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              },
              cursor: 'pointer',
            }}
            onClick={() => navigate('/profile')}
          >
            <Avatar 
              alt={currentUser.username || 'User'} 
              src={currentUser.avatar} 
              sx={{ 
                width: 40, 
                height: 40,
                backgroundColor: theme.palette.primary.main,
              }}
            >
              {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <Box sx={{ ml: 2 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {currentUser?.username || '用户'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                查看个人资料
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      <List component="nav" sx={{ px: 1, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton 
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  backgroundColor: isSelected 
                    ? alpha(theme.palette.primary.main, 0.1) 
                    : 'transparent',
                  color: isSelected ? theme.palette.primary.main : 'inherit',
                  '&:hover': {
                    backgroundColor: isSelected 
                      ? alpha(theme.palette.primary.main, 0.1) 
                      : alpha(theme.palette.primary.main, 0.05),
                  },
                  py: 1,
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: isSelected ? theme.palette.primary.main : 'inherit',
                    minWidth: 42,
                  }}
                >
                  {item.notificationCount ? (
                    <Badge color="error" badgeContent={item.notificationCount}>
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isSelected ? 600 : 400,
                  }}
                />
                {isSelected && (
                  <Box
                    sx={{
                      width: 4,
                      height: 24,
                      backgroundColor: theme.palette.primary.main,
                      borderRadius: 4,
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ p: 2, mt: 'auto' }}>
        <Button 
          variant="outlined" 
          fullWidth 
          startIcon={<HelpIcon />}
          sx={{ 
            borderColor: alpha(theme.palette.primary.main, 0.5), 
            mb: 2,
            textTransform: 'none',
            borderRadius: 2,
          }}
        >
          帮助中心
        </Button>
        <Button 
          variant="contained" 
          fullWidth 
          color="error" 
          startIcon={<Logout />} 
          onClick={handleLogout}
          sx={{ 
            textTransform: 'none',
            borderRadius: 2,
          }}
        >
          退出登录
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" fontWeight={600}>
              {getPageTitle()}
            </Typography>
            {!isTablet && (
              <Chip 
                label="MVP 阶段" 
                size="small" 
                color="primary" 
                variant="outlined"
                sx={{ ml: 2 }} 
              />
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="搜索">
              <IconButton color="inherit" size="large" sx={{ mr: 1 }}>
                <SearchIcon />
              </IconButton>
            </Tooltip>
            
            {!isMobile && (
              <Tooltip title="切换主题">
                <IconButton color="inherit" size="large" sx={{ mr: 1 }}>
                  <DarkModeIcon />
                </IconButton>
              </Tooltip>
            )}
            
            <Tooltip title="通知">
              <IconButton color="inherit" size="large" sx={{ mr: 1 }}>
                <Badge badgeContent={2} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <Tooltip title="个人资料">
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                <Avatar 
                  sx={{ 
                    width: 36, 
                    height: 36,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  }}
                >
                  {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>

          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 180,
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              }
            }}
          >
            <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              个人资料
            </MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); navigate('/settings'); }}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              系统设置
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              退出登录
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: 'none',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: alpha(theme.palette.background.default, 0.7),
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout; 