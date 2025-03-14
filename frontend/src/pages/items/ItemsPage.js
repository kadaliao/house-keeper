import React, { useState, useEffect, useRef } from 'react';
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
  InputAdornment,
  CardMedia,
  OutlinedInput,
  Checkbox,
  ListItemText
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Search as SearchIcon,
  Category as CategoryIcon,
  LocationOn as LocationIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';

import { getItems, createItem, updateItem, deleteItem, searchItems } from '../../services/items';
import { getLocations } from '../../services/locations';
import { uploadImage } from '../../services/uploads';

const ItemsPage = () => {
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
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

  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // 获取所有物品和位置
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

  // 首次加载时获取数据
  useEffect(() => {
    fetchData();
  }, []);

  // 查询过滤
  useEffect(() => {
    const fetchFilteredItems = async () => {
      try {
        setLoading(true);
        let params = {};
        
        if (searchQuery) {
          params.search = searchQuery;
        }
        
        if (selectedCategories.length > 0) {
          params.categories = selectedCategories.join(',');
        }
        
        const filteredItems = await searchItems(params);
        setItems(filteredItems);
      } catch (err) {
        console.error('搜索物品失败:', err);
        setError('搜索物品失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };
    
    if (searchQuery || selectedCategories.length > 0) {
      fetchFilteredItems();
    } else {
      fetchData();
    }
  }, [searchQuery, selectedCategories]);

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
    setImagePreview(item.image_url);
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
        
        // 删除成功后，重新获取最新的物品列表
        await fetchData();
        
        setSnackbar({
          open: true,
          message: '物品删除成功',
          severity: 'success'
        });
      } catch (err) {
        console.error('删除物品失败:', err);
        
        // 检查是否是404错误（物品不存在）
        if (err.response && err.response.status === 404) {
          // 物品已不存在，重新获取最新列表
          await fetchData();
          
          setSnackbar({
            open: true,
            message: '物品已不存在，列表已更新',
            severity: 'info'
          });
        } else {
          // 其他错误
          setSnackbar({
            open: true,
            message: '删除物品失败，请稍后重试',
            severity: 'error'
          });
        }
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
  const handleCategoryChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedCategories(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
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

  // 处理图片上传
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setSnackbar({
        open: true,
        message: '请选择图片文件',
        severity: 'error'
      });
      return;
    }

    // 创建预览
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    try {
      setUploadingImage(true);
      
      // 上传图片
      const response = await uploadImage(file);
      
      // 更新表单数据
      setFormData({
        ...formData,
        image_url: response.url
      });
      
      setSnackbar({
        open: true,
        message: '图片上传成功',
        severity: 'success'
      });
    } catch (err) {
      console.error('图片上传失败:', err);
      setSnackbar({
        open: true,
        message: '图片上传失败，请稍后重试',
        severity: 'error'
      });
    } finally {
      setUploadingImage(false);
    }
  };

  // 处理移除图片
  const handleRemoveImage = () => {
    setFormData({
      ...formData,
      image_url: ''
    });
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 处理图片URL
  const getImageUrl = (url) => {
    if (!url) return null;
    
    // 如果已经是完整URL（包含http或https），则直接返回
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // 如果是相对路径，则使用后端的基础URL
    // 从环境变量或默认值获取API URL的基础部分
    const apiUrl = process.env.REACT_APP_API_URL || '/api/v1';
    const baseUrl = apiUrl.replace('/api/v1', '');
    
    // 确保路径格式正确
    if (url.startsWith('/')) {
      return `${baseUrl}${url}`;
    } else {
      return `${baseUrl}/${url}`;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          物品管理
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
        >
          添加物品
        </Button>
      </Box>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        在这里管理您的所有物品
      </Typography>
      
      {/* 搜索和筛选工具栏 */}
      <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <TextField
          placeholder="搜索物品..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={handleSearch}
          sx={{ flexGrow: 1, minWidth: 200 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel id="category-multiple-checkbox-label">按类别筛选</InputLabel>
          <Select
            labelId="category-multiple-checkbox-label"
            id="category-multiple-checkbox"
            multiple
            value={selectedCategories}
            onChange={handleCategoryChange}
            input={<OutlinedInput label="按类别筛选" />}
            renderValue={(selected) => selected.join(', ')}
          >
            {getCategories().map((category) => (
              <MenuItem key={category} value={category}>
                <Checkbox checked={selectedCategories.indexOf(category) > -1} />
                <ListItemText primary={category} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {(searchQuery || selectedCategories.length > 0) && (
          <Button 
            variant="outlined"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategories([]);
            }}
          >
            清除筛选
          </Button>
        )}
      </Box>

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
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  }
                }}
              >
                {item.image_url && (
                  <CardMedia
                    component="img"
                    height="160"
                    image={getImageUrl(item.image_url)}
                    alt={item.name}
                    onError={(e) => {
                      console.error('图片加载失败:', item.image_url);
                      e.target.src = 'https://placehold.co/400x160?text=图片加载失败';
                    }}
                    sx={{ objectFit: 'cover' }}
                  />
                )}
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
            <Grid item xs={12}>
              <Box sx={{ mb: 2, mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  物品图片
                </Typography>
                
                {/* 图片预览 */}
                {(imagePreview || formData.image_url) && (
                  <Box sx={{ mb: 2, position: 'relative' }}>
                    <img 
                      src={imagePreview || getImageUrl(formData.image_url)} 
                      alt="物品预览" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '200px', 
                        borderRadius: '8px',
                        border: '1px solid #eee'
                      }}
                      onError={(e) => {
                        console.error('图片预览加载失败:', imagePreview || formData.image_url);
                        e.target.src = 'https://placehold.co/200?text=图片加载失败';
                      }}
                    />
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={handleRemoveImage}
                      sx={{ position: 'absolute', top: 5, right: 5, bgcolor: 'rgba(255,255,255,0.7)' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                )}
                
                {/* 上传按钮 */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    ref={fileInputRef}
                    accept="image/*"
                    type="file"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                    id="raised-button-file"
                  />
                  <label htmlFor="raised-button-file">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<UploadIcon />}
                      disabled={uploadingImage}
                      sx={{ mr: 1 }}
                    >
                      {uploadingImage ? '上传中...' : '选择图片'}
                    </Button>
                  </label>
                  {uploadingImage && <CircularProgress size={24} sx={{ ml: 1 }} />}
                </Box>
                
                {/* 图片URL手动输入 */}
                <TextField
                  fullWidth
                  label="图片URL（可选）"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  margin="normal"
                  helperText="您也可以直接输入图片链接"
                />
              </Box>
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