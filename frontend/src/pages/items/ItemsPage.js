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
  InputAdornment
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Search as SearchIcon,
  Category as CategoryIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';

import { getItems, createItem, updateItem, deleteItem, searchItems } from '../../services/items';
import { getLocations } from '../../services/locations';

const ItemsPage = () => {
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    quantity: 1,
    price: '',
    purchase_date: null,
    expiry_date: null,
    location_id: '',
    image_url: ''
  });

  // 获取所有物品和位置
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [itemsData, locationsData] = await Promise.all([
          getItems(),
          getLocations()
        ]);
        setItems(itemsData);
        setLocations(locationsData);
        setError(null);
      } catch (err) {
        console.error('获取数据失败:', err);
        setError('获取数据失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 搜索物品
  useEffect(() => {
    const fetchFilteredItems = async () => {
      try {
        setLoading(true);
        let filteredItems;
        
        if (searchQuery) {
          filteredItems = await searchItems(searchQuery);
        } else if (selectedCategory) {
          filteredItems = await getItems({ category: selectedCategory });
        } else {
          filteredItems = await getItems();
        }
        
        setItems(filteredItems);
        setError(null);
      } catch (err) {
        console.error('搜索物品失败:', err);
        setError('搜索物品失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredItems();
  }, [searchQuery, selectedCategory]);

  // 获取所有类别
  const getCategories = () => {
    const categories = [...new Set(items.map(item => item.category).filter(Boolean))];
    return categories;
  };

  // 处理表单输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // 处理日期变化
  const handleDateChange = (name, date) => {
    setFormData({
      ...formData,
      [name]: date
    });
  };

  // 打开添加物品对话框
  const handleOpenAddDialog = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      quantity: 1,
      price: '',
      purchase_date: null,
      expiry_date: null,
      location_id: '',
      image_url: ''
    });
    setOpenDialog(true);
  };

  // 打开编辑物品对话框
  const handleOpenEditDialog = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      category: item.category || '',
      quantity: item.quantity || 1,
      price: item.price || '',
      purchase_date: item.purchase_date ? new Date(item.purchase_date) : null,
      expiry_date: item.expiry_date ? new Date(item.expiry_date) : null,
      location_id: item.location_id || '',
      image_url: item.image_url || ''
    });
    setOpenDialog(true);
  };

  // 关闭对话框
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // 保存物品
  const handleSaveItem = async () => {
    try {
      setLoading(true);
      
      // 验证必填字段
      if (!formData.name) {
        setSnackbar({
          open: true,
          message: '物品名称不能为空',
          severity: 'error'
        });
        setLoading(false);
        return;
      }

      const itemData = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : null,
        quantity: parseInt(formData.quantity, 10) || 1,
        location_id: formData.location_id || null
      };

      let savedItem;
      
      if (editingItem) {
        // 更新物品
        savedItem = await updateItem(editingItem.id, itemData);
        setSnackbar({
          open: true,
          message: '物品更新成功',
          severity: 'success'
        });
      } else {
        // 创建新物品
        savedItem = await createItem(itemData);
        setSnackbar({
          open: true,
          message: '物品添加成功',
          severity: 'success'
        });
      }

      // 更新物品列表
      setItems(prevItems => {
        if (editingItem) {
          return prevItems.map(item => item.id === editingItem.id ? savedItem : item);
        } else {
          return [...prevItems, savedItem];
        }
      });

      handleCloseDialog();
    } catch (err) {
      console.error('保存物品失败:', err);
      setSnackbar({
        open: true,
        message: '保存物品失败，请稍后重试',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // 删除物品
  const handleDeleteItem = async (id) => {
    if (window.confirm('确定要删除这个物品吗？')) {
      try {
        setLoading(true);
        await deleteItem(id);
        
        // 更新物品列表
        setItems(prevItems => prevItems.filter(item => item.id !== id));
        
        setSnackbar({
          open: true,
          message: '物品删除成功',
          severity: 'success'
        });
      } catch (err) {
        console.error('删除物品失败:', err);
        setSnackbar({
          open: true,
          message: '删除物品失败，请稍后重试',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // 处理搜索
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // 处理类别筛选
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  // 关闭提示框
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // 获取位置名称
  const getLocationName = (locationId) => {
    const location = locations.find(loc => loc.id === locationId);
    return location ? location.name : '未指定';
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          物品管理
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
          在这里管理您的所有物品
        </Typography>
        
        {/* 搜索和筛选 */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="搜索物品..."
              value={searchQuery}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="category-select-label">按类别筛选</InputLabel>
              <Select
                labelId="category-select-label"
                value={selectedCategory}
                onChange={handleCategoryChange}
                label="按类别筛选"
                startAdornment={
                  <InputAdornment position="start">
                    <CategoryIcon />
                  </InputAdornment>
                }
              >
                <MenuItem value="">
                  <em>全部类别</em>
                </MenuItem>
                {getCategories().map((category, index) => (
                  <MenuItem key={index} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenAddDialog}
              sx={{ height: '56px' }}
            >
              添加物品
            </Button>
          </Grid>
        </Grid>

        {/* 错误提示 */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* 物品列表 */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : items.length === 0 ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            暂无物品数据，请点击"添加物品"按钮添加
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {items.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {item.name}
                      </Typography>
                      {item.category && (
                        <Chip 
                          label={item.category} 
                          size="small" 
                          color="primary" 
                          variant="outlined" 
                        />
                      )}
                    </Box>
                    
                    {item.description && (
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        {item.description}
                      </Typography>
                    )}
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Grid container spacing={1} sx={{ mt: 1 }}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                          数量: {item.quantity}
                        </Typography>
                      </Grid>
                      {item.price && (
                        <Grid item xs={6}>
                          <Typography variant="body2" color="textSecondary">
                            价格: ¥{item.price.toFixed(2)}
                          </Typography>
                        </Grid>
                      )}
                      {item.location_id && (
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <LocationIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                            <Typography variant="body2" color="textSecondary">
                              位置: {getLocationName(item.location_id)}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      {item.purchase_date && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="textSecondary">
                            购买日期: {format(new Date(item.purchase_date), 'yyyy-MM-dd')}
                          </Typography>
                        </Grid>
                      )}
                      {item.expiry_date && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="textSecondary">
                            过期日期: {format(new Date(item.expiry_date), 'yyyy-MM-dd')}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                  <CardActions>
                    <Tooltip title="编辑">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleOpenEditDialog(item)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="删除">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* 添加/编辑物品对话框 */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingItem ? '编辑物品' : '添加物品'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="物品名称"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="类别"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
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
              <TextField
                fullWidth
                label="数量"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleInputChange}
                InputProps={{ inputProps: { min: 1 } }}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="价格"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                InputProps={{ 
                  inputProps: { min: 0, step: 0.01 },
                  startAdornment: <InputAdornment position="start">¥</InputAdornment>,
                }}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="location-select-label">存放位置</InputLabel>
                <Select
                  labelId="location-select-label"
                  name="location_id"
                  value={formData.location_id}
                  onChange={handleInputChange}
                  label="存放位置"
                >
                  <MenuItem value="">
                    <em>未指定</em>
                  </MenuItem>
                  {locations.map((location) => (
                    <MenuItem key={location.id} value={location.id}>
                      {location.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="图片URL"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="购买日期"
                value={formData.purchase_date}
                onChange={(date) => handleDateChange('purchase_date', date)}
                renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                format="yyyy-MM-dd"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="过期日期"
                value={formData.expiry_date}
                onChange={(date) => handleDateChange('expiry_date', date)}
                renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                format="yyyy-MM-dd"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            取消
          </Button>
          <Button 
            onClick={handleSaveItem} 
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

export default ItemsPage; 