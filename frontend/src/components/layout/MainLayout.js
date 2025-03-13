import React, { useState, useEffect } from 'react';
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
  useTheme as useMuiTheme,
  alpha,
  Badge,
  Tooltip,
  Button,
  Chip,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  InputAdornment,
  CircularProgress,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Paper,
  Tab,
  Tabs
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
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useReminders } from '../../contexts/ReminderContext';
import { searchItems } from '../../services/items';
import { getLocations } from '../../services/locations';

const drawerWidth = 260;

const MainLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { currentUser, logout } = useAuth();
  const { mode, toggleColorMode } = useTheme();
  const { getTotalCount } = useReminders();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // 搜索相关状态
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({
    items: [],
    locations: []
  });
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTab, setSearchTab] = useState(0);

  // 处理搜索
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults({
        items: [],
        locations: []
      });
      return;
    }

    setSearchLoading(true);
    try {
      // 搜索物品
      const items = await searchItems({ search: query });
      
      // 搜索位置 (简单过滤)
      const allLocations = await getLocations();
      const locations = allLocations.filter(loc => 
        loc.name.toLowerCase().includes(query.toLowerCase()) || 
        (loc.description && loc.description.toLowerCase().includes(query.toLowerCase()))
      );
      
      setSearchResults({
        items,
        locations
      });
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  // 当搜索查询变化时执行搜索
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchDialogOpen) {
        handleSearch(searchQuery);
      }
    }, 300);
    
    return () => clearTimeout(delaySearch);
  }, [searchQuery, searchDialogOpen]);

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

  const handleThemeToggle = () => {
    toggleColorMode();
  };

  const handleOpenSearchDialog = () => {
    setSearchDialogOpen(true);
    setSearchQuery('');
    setSearchResults({
      items: [],
      locations: []
    });
  };

  const handleCloseSearchDialog = () => {
    setSearchDialogOpen(false);
  };

  const handleSearchTabChange = (event, newValue) => {
    setSearchTab(newValue);
  };

  const handleSearchItemClick = (item) => {
    navigate(`/items/${item.id}`);
    handleCloseSearchDialog();
  };

  const handleSearchLocationClick = (location) => {
    navigate(`/locations?selected=${location.id}`);
    handleCloseSearchDialog();
  };

  const menuItems = [
    { text: '仪表盘', icon: <DashboardIcon />, path: '/dashboard' },
    { text: '物品', icon: <InventoryIcon />, path: '/items' },
    { text: '位置', icon: <LocationIcon />, path: '/locations' },
    { text: '提醒', icon: <NotificationsIcon />, path: '/reminders', notificationCount: getTotalCount() },
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Button 
            variant="outlined" 
            sx={{ 
              borderColor: alpha(theme.palette.primary.main, 0.5), 
              textTransform: 'none',
              borderRadius: 2,
              flex: 1,
              mr: 1
            }}
            startIcon={<HelpIcon />}
          >
            帮助中心
          </Button>
          <Tooltip title={mode === 'light' ? '切换到暗色模式' : '切换到亮色模式'}>
            <IconButton 
              onClick={handleThemeToggle} 
              color="primary" 
              sx={{ 
                border: `1px solid ${alpha(theme.palette.primary.main, 0.5)}`,
                borderRadius: 2,
              }}
            >
              {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Tooltip>
        </Box>
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
              <IconButton 
                color="inherit" 
                size="large" 
                sx={{ mr: 1 }}
                onClick={handleOpenSearchDialog}
              >
                <SearchIcon />
              </IconButton>
            </Tooltip>
            
            {!isMobile && (
              <Tooltip title={mode === 'light' ? '切换到暗色模式' : '切换到亮色模式'}>
                <IconButton 
                  color="inherit" 
                  size="large" 
                  sx={{ mr: 1 }}
                  onClick={handleThemeToggle}
                >
                  {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
                </IconButton>
              </Tooltip>
            )}
            
            <Tooltip title="通知">
              <IconButton 
                color="inherit" 
                size="large" 
                sx={{ mr: 1 }}
                onClick={() => navigate('/reminders')}
              >
                <Badge badgeContent={getTotalCount()} color="error">
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
        {children}
      </Box>

      {/* 搜索对话框 */}
      <Dialog 
        open={searchDialogOpen} 
        onClose={handleCloseSearchDialog}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '80vh'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">全局搜索</Typography>
            <IconButton onClick={handleCloseSearchDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            placeholder="搜索物品、位置..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchLoading && (
                <InputAdornment position="end">
                  <CircularProgress size={20} />
                </InputAdornment>
              )
            }}
            sx={{ mb: 2 }}
          />
          
          {(searchResults.items.length > 0 || searchResults.locations.length > 0) && (
            <>
              <Tabs 
                value={searchTab} 
                onChange={handleSearchTabChange}
                sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab 
                  label={`物品 (${searchResults.items.length})`} 
                  id="search-tab-0"
                  aria-controls="search-tabpanel-0"
                />
                <Tab 
                  label={`位置 (${searchResults.locations.length})`} 
                  id="search-tab-1"
                  aria-controls="search-tabpanel-1"
                />
              </Tabs>
              
              <Box
                role="tabpanel"
                hidden={searchTab !== 0}
                id="search-tabpanel-0"
                aria-labelledby="search-tab-0"
              >
                {searchTab === 0 && (
                  <Grid container spacing={2}>
                    {searchResults.items.map((item) => (
                      <Grid item xs={12} sm={6} key={item.id}>
                        <Card variant="outlined" sx={{ height: '100%' }}>
                          <CardActionArea onClick={() => handleSearchItemClick(item)}>
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <InventoryIcon color="primary" sx={{ mr: 1 }} />
                                <Typography variant="subtitle1" component="div">
                                  {item.name}
                                </Typography>
                              </Box>
                              {item.description && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                  {item.description.length > 100 
                                    ? `${item.description.substring(0, 100)}...` 
                                    : item.description}
                                </Typography>
                              )}
                              <Box sx={{ display: 'flex', mt: 1, gap: 1, flexWrap: 'wrap' }}>
                                {item.category && (
                                  <Chip 
                                    label={item.category} 
                                    size="small" 
                                    color="primary" 
                                    variant="outlined" 
                                  />
                                )}
                                {item.location_id && (
                                  <Chip 
                                    icon={<LocationIcon />} 
                                    label={searchResults.locations.find(loc => loc.id === item.location_id)?.name || '位置'} 
                                    size="small" 
                                    variant="outlined" 
                                  />
                                )}
                              </Box>
                            </CardContent>
                          </CardActionArea>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
              
              <Box
                role="tabpanel"
                hidden={searchTab !== 1}
                id="search-tabpanel-1"
                aria-labelledby="search-tab-1"
              >
                {searchTab === 1 && (
                  <Grid container spacing={2}>
                    {searchResults.locations.map((location) => (
                      <Grid item xs={12} sm={6} key={location.id}>
                        <Card variant="outlined" sx={{ height: '100%' }}>
                          <CardActionArea onClick={() => handleSearchLocationClick(location)}>
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <LocationIcon color="primary" sx={{ mr: 1 }} />
                                <Typography variant="subtitle1" component="div">
                                  {location.name}
                                </Typography>
                              </Box>
                              {location.description && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                  {location.description.length > 100 
                                    ? `${location.description.substring(0, 100)}...` 
                                    : location.description}
                                </Typography>
                              )}
                              {location.parent_id && (
                                <Box sx={{ mt: 1 }}>
                                  <Chip 
                                    label={`父位置: ${searchResults.locations.find(loc => loc.id === location.parent_id)?.name || '未知'}`}
                                    size="small" 
                                    variant="outlined" 
                                  />
                                </Box>
                              )}
                            </CardContent>
                          </CardActionArea>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            </>
          )}
          
          {searchQuery && !searchLoading && searchResults.items.length === 0 && searchResults.locations.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                未找到与 "{searchQuery}" 相关的结果
              </Typography>
            </Box>
          )}
          
          {!searchQuery && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <SearchIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                输入关键词搜索物品和位置
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MainLayout; 