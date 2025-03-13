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
  Divider,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  CardMedia,
  Chip
} from '@mui/material';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  LocationOn as LocationIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  Upload as UploadIcon,
  Inventory2
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

import { getLocations, createLocation, updateLocation, deleteLocation } from '../../services/locations';
import { uploadImage } from '../../services/uploads';
import { getItemsByLocation } from '../../services/items';

const LocationsPage = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [expanded, setExpanded] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_id: '',
    image_url: ''
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const fileInputRef = useRef(null);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const selectedLocationId = queryParams.get('selected');

  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState('tree');

  // 获取位置列表数据
  const fetchLocations = async () => {
    try {
      setLoading(true);
      console.log('开始获取位置列表数据');
      const locationsData = await getLocations();
      console.log('获取到的位置列表数据:', locationsData);
      
      // 确保每个位置都有有效的ID
      const processedData = locationsData.map((loc, index) => {
        if (!loc.id) {
          console.warn('位置缺少ID:', loc);
          return { ...loc, id: `temp-id-${index}` };
        }
        return loc;
      });
      
      setLocations(processedData);
    } catch (error) {
      console.error('获取位置列表失败:', error);
      setSnackbar({
        open: true,
        message: '获取位置列表失败，请刷新页面重试',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时获取位置数据
  useEffect(() => {
    console.log('LocationsPage组件挂载，开始获取位置数据');
    fetchLocations();
  }, []);

  useEffect(() => {
    // 如果通过URL传入了selected参数，自动选择对应位置
    if (selectedLocationId && locations.length > 0) {
      const locationToSelect = locations.find(
        loc => loc.id === parseInt(selectedLocationId, 10)
      );
      
      if (locationToSelect) {
        setSelectedNode([`${locationToSelect.id}`]);
        
        // 找到所有父节点并展开
        let parent = locationToSelect.parent_id;
        const parentsToExpand = [];
        
        while (parent) {
          parentsToExpand.push(`${parent}`);
          const parentLocation = locations.find(loc => loc.id === parent);
          parent = parentLocation ? parentLocation.parent_id : null;
        }
        
        if (parentsToExpand.length > 0) {
          setExpanded(prev => [...new Set([...prev, ...parentsToExpand])]);
        }
        
        // 选中后自动设置为编辑状态
        setEditingLocation(locationToSelect);
        setOpenDialog(true);
      }
    }
  }, [locations, selectedLocationId]);

  // 处理表单输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // 打开添加位置对话框
  const handleOpenAddDialog = (parentId = '') => {
    setEditingLocation(null);
    setFormData({
      name: '',
      description: '',
      parent_id: parentId,
      image_url: ''
    });
    setImagePreview(null);
    setOpenDialog(true);
  };

  // 打开编辑位置对话框
  const handleOpenEditDialog = (location) => {
    console.log('打开编辑对话框, 位置数据:', location);
    
    setEditingLocation(location);
    if (location) {
      const imageUrl = location.image_url || '';
      console.log('编辑位置的图片URL:', imageUrl);
      
      setFormData({
        name: location.name || '',
        description: location.description || '',
        parent_id: location.parent_id || '',
        image_url: imageUrl
      });
      // 在编辑模式下，初始时不显示文件名，因为这是已保存的URL
      setImagePreview(null);
    } else {
      setFormData({
        name: '',
        description: '',
        parent_id: '',
        image_url: ''
      });
      setImagePreview(null);
    }
    setOpenDialog(true);
  };

  // 关闭对话框
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // 保存位置
  const handleSaveLocation = async () => {
    if (!formData.name) {
      setSnackbar({ open: true, message: '位置名称不能为空', severity: 'error' });
      return;
    }

    try {
      setLoading(true);
      const locationData = {
        name: formData.name,
        parentId: formData.parent_id === 0 ? null : formData.parent_id,
        description: formData.description || '',
        imageUrl: formData.image_url || ''
      };
      
      console.log('保存位置前的数据:', locationData);
      console.log('保存的图片URL:', locationData.imageUrl);

      let response;
      if (editingLocation) {
        response = await updateLocation(editingLocation.id, locationData);
        setSnackbar({ open: true, message: '位置更新成功', severity: 'success' });
        console.log('位置更新成功:', response);
      } else {
        response = await createLocation(locationData);
        setSnackbar({ open: true, message: '位置创建成功', severity: 'success' });
        console.log('位置创建成功:', response);
      }
      
      // 确保刷新位置列表
      fetchLocations();
      handleCloseDialog();
    } catch (error) {
      console.error('保存位置失败:', error);
      const errorMessage = error.response?.data?.message || error.message || '操作失败';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // 删除位置
  const handleDeleteLocation = async (id) => {
    // 检查是否有子位置
    const hasChildren = locations.some(loc => loc.parent_id === id);
    
    if (hasChildren) {
      setSnackbar({
        open: true,
        message: '无法删除含有子位置的位置，请先删除所有子位置',
        severity: 'error'
      });
      return;
    }
    
    if (window.confirm('确定要删除这个位置吗？')) {
      try {
        setLoading(true);
        await deleteLocation(id);
        
        // 更新位置列表
        setLocations(prevLocations => prevLocations.filter(loc => loc.id !== id));
        
        setSnackbar({
          open: true,
          message: '位置删除成功',
          severity: 'success'
        });
      } catch (err) {
        console.error('删除位置失败:', err);
        setSnackbar({
          open: true,
          message: '删除位置失败，请稍后重试',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // 关闭提示框
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // 处理树形视图展开/折叠
  const handleToggle = (event, nodeIds) => {
    setExpanded(nodeIds);
  };

  // 处理树形节点选择
  const handleNodeSelect = (event, nodeId) => {
    setSelectedNode(nodeId);
    // 此处可以添加节点选择后的其他操作，比如显示详情等
  };

  /**
   * 重要：MUI X Tree View组件要求每个节点必须有唯一的ID
   * 如果有节点没有ID或者ID重复，会导致渲染错误
   * 下面的函数生成树形结构，确保每个节点都有唯一ID
   * 对于没有ID的节点，会生成一个包含随机字符串的临时ID
   * 这样可以避免"Two items were provided with the same id in the `items` prop: undefined"的错误
   */
  // 构建位置树形结构
  const buildLocationTree = (parentId = null) => {
    // 由于后端可能返回字符串或数字ID，需要兼容处理
    const compareParentId = (locationParentId) => {
      // 如果两者都是null或undefined，视为相等
      if (locationParentId == null && parentId == null) {
        return true;
      }
      
      // 转换为字符串进行比较
      return String(locationParentId) === String(parentId);
    };
    
    return locations
      .filter(location => compareParentId(location.parent_id))
      .map((location, index) => {
        const children = buildLocationTree(location.id);
        // 确保每个节点都有明确定义的ID
        // 使用随机字符串确保ID不会重复，即使是undefined也不会导致冲突
        const nodeId = location.id ? location.id.toString() : `temp-${parentId || 'root'}-${index}-${Math.random().toString(36).substring(2, 10)}`;
        return {
          ...location,
          id: nodeId,
          children: children
        };
      });
  };

  // 渲染位置树形节点
  const renderTreeNodes = (nodes) => {
    if (!nodes || !Array.isArray(nodes)) {
      console.warn('节点无效:', nodes);
      return null;
    }
    
    return nodes.map((node, index) => {
      if (!node) {
        console.warn('发现无效节点，跳过渲染');
        return null;
      }
      
      // 确保节点有有效ID，并且与buildLocationTree中的ID生成逻辑保持一致
      // 不再单独生成ID，直接使用节点已有的ID，确保不会与构建树时生成的ID冲突
      const safeNodeId = node.id && node.id.toString();
      
      // 如果节点ID不存在，不渲染此节点，避免ID冲突
      if (!safeNodeId) {
        console.warn('跳过无ID节点渲染:', node);
        return null;
      }
      
      return (
        <TreeItem 
          key={safeNodeId} 
          itemId={safeNodeId} 
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body1">{node.name || '未命名位置'}</Typography>
              </Box>
              <Box>
                <Tooltip title="添加子位置">
                  <IconButton 
                    size="small" 
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      try {
                        handleOpenAddDialog(node.id);
                      } catch (err) {
                        console.error('添加子位置错误:', err);
                      }
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="编辑">
                  <IconButton 
                    size="small" 
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      try {
                        handleOpenEditDialog(node);
                      } catch (err) {
                        console.error('编辑位置错误:', err);
                      }
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="删除">
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      try {
                        handleDeleteLocation(node.id);
                      } catch (err) {
                        console.error('删除位置错误:', err);
                      }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          }
        >
          {node.children && Array.isArray(node.children) && node.children.length > 0 ? 
            renderTreeNodes(node.children) : null}
        </TreeItem>
      );
    });
  };

  // 获取位置树
  const locationTree = buildLocationTree(null);

  // 处理图片上传
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // 检查文件类型
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setSnackbar({
        open: true,
        message: '只支持JPG、PNG、GIF和WEBP格式的图片',
        severity: 'error'
      });
      return;
    }

    try {
      setUploadingImage(true);
      const result = await uploadImage(file);
      console.log('图片上传结果:', result);
      console.log('上传服务返回的图片URL:', result.url);
      
      // 直接使用uploadImage返回的完整URL
      setFormData({
        ...formData,
        image_url: result.url
      });
      
      // 更新显示文件名
      setSelectedFileName(file.name);
      // 设置图片预览
      setImagePreview(result.url);
      
      setSnackbar({
        open: true,
        message: '图片上传成功',
        severity: 'success'
      });
    } catch (error) {
      console.error('图片上传失败:', error);
      setSnackbar({
        open: true,
        message: '图片上传失败，请重试',
        severity: 'error'
      });
    } finally {
      setUploadingImage(false);
    }
  };

  // 移除已上传的图片
  const handleRemoveImage = () => {
    console.log('移除图片前的formData:', formData);
    
    // 清除文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // 清除表单数据中的图片URL
    setFormData({
      ...formData,
      image_url: ''
    });
    
    // 清除图片预览和文件名
    setImagePreview(null);
    setSelectedFileName('');
    
    console.log('移除图片后的formData:', {...formData, image_url: ''});
  };

  // 修复图片URL处理函数，避免重复添加API_URL
  const getImageUrl = (url) => {
    if (!url) {
      return '';
    }
    
    const API_URL = process.env.REACT_APP_API_URL || '/api/v1';
    console.log('getImageUrl 函数处理图片URL:', url, 'API_URL:', API_URL);
    
    // 检查URL是否已经包含API_URL前缀
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith(API_URL)) {
      console.log('图片URL已经是完整路径，不需要添加前缀:', url);
      return url;
    }
    
    // 确保URL以斜杠开头
    const formattedUrl = url.startsWith('/') ? url : `/${url}`;
    const fullUrl = `${API_URL}${formattedUrl}`;
    console.log('图片URL添加API_URL前缀后:', fullUrl);
    return fullUrl;
  };

  // 渲染位置卡片视图
  const renderLocationCards = () => {
    if (!locations?.length) {
      return (
        <Typography sx={{ p: 2 }} color="textSecondary" align="center">
          暂无位置数据
        </Typography>
      );
    }

    return (
      <Grid container spacing={2} sx={{ p: 2 }}>
        {locations.map((location) => {
          console.log('渲染位置卡片:', location.name, '图片URL:', location.image_url);
          const displayImageUrl = getImageUrl(location.image_url);
          console.log('处理后的显示图片URL:', displayImageUrl);
          
          return (
            <Grid item xs={12} sm={6} md={4} key={location.id}>
              <Card elevation={3}>
                <CardMedia
                  component="img"
                  height="140"
                  image={displayImageUrl || '/static/images/placeholder.png'}
                  alt={location.name}
                  onError={(e) => {
                    console.error('图片加载失败:', displayImageUrl);
                    e.target.src = '/static/images/placeholder.png';
                    e.target.onerror = null;
                  }}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div">
                    {location.name}
                  </Typography>
                  {location.description && (
                    <Typography variant="body2" color="text.secondary">
                      {location.description}
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<Inventory2 />}
                    onClick={() => navigate(`/items?location=${location.id}`)}
                  >
                    查看物品
                  </Button>
                  <Box sx={{ flexGrow: 1 }} />
                  <IconButton 
                    size="small" 
                    onClick={() => handleOpenEditDialog(location)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => handleDeleteLocation(location.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          位置管理
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
          在这里管理您的存储位置
        </Typography>
        
        {/* 添加位置按钮 */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenAddDialog()}
          >
            添加顶级位置
          </Button>
          
          <Button
            color="secondary"
            onClick={() => setViewMode(viewMode === 'tree' ? 'cards' : 'tree')}
          >
            {viewMode === 'tree' ? '切换到卡片视图' : '切换到树形视图'}
          </Button>
        </Box>

        {/* 错误提示 */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* 位置展示 */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : viewMode === 'tree' ? (
          <Card variant="outlined" sx={{ mt: 2 }}>
            <CardContent>
              <SimpleTreeView
                defaultCollapseIcon={<ExpandMoreIcon />}
                defaultExpandIcon={<ChevronRightIcon />}
                expandedItems={expanded}
                selectedItems={selectedNode}
                onExpandedItemsChange={handleToggle}
                onSelectedItemsChange={handleNodeSelect}
                sx={{ 
                  flexGrow: 1, 
                  overflowY: 'auto',
                  '& .MuiTreeItem-root': {
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }
                }}
              >
                {renderTreeNodes(locationTree)}
              </SimpleTreeView>
            </CardContent>
          </Card>
        ) : (
          <Box sx={{ mt: 2 }}>
            {renderLocationCards()}
          </Box>
        )}
      </Box>

      {/* 添加/编辑位置对话框 */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>{editingLocation ? '编辑位置' : '添加位置'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="位置名称"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  autoFocus
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
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="parent-location-label">父位置</InputLabel>
                  <Select
                    labelId="parent-location-label"
                    name="parent_id"
                    value={formData.parent_id}
                    onChange={handleInputChange}
                    label="父位置"
                  >
                    <MenuItem value="">
                      <em>无 (顶级位置)</em>
                    </MenuItem>
                    {locations.map((loc) => (
                      <MenuItem 
                        key={loc.id} 
                        value={loc.id}
                        disabled={editingLocation && loc.id === editingLocation.id}
                      >
                        {loc.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  位置图片
                </Typography>
                
                {/* 显示已上传图片的预览 */}
                {(imagePreview || formData.image_url) && (
                  <Box sx={{ mb: 2, position: 'relative' }}>
                    <img 
                      src={imagePreview || getImageUrl(formData.image_url)} 
                      alt="位置图片预览" 
                      style={{ 
                        width: '100%', 
                        maxHeight: '200px', 
                        objectFit: 'contain', 
                        border: '1px solid #eee', 
                        borderRadius: '4px' 
                      }} 
                      onError={(e) => {
                        console.error('预览图片加载失败:', imagePreview || formData.image_url);
                        e.target.src = '/static/images/placeholder.png';
                      }}
                    />
                    <IconButton
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 5,
                        right: 5,
                        bgcolor: 'rgba(255,255,255,0.8)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                      }}
                      onClick={handleRemoveImage}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
                
                {/* 上传按钮 */}
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  startIcon={<UploadIcon />}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? '上传中...' : '上传位置图片'}
                  <input
                    type="file"
                    hidden
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                  />
                </Button>
                
                {selectedFileName && (
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    已选择: {selectedFileName}
                  </Typography>
                )}
                
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  支持JPG、PNG、GIF和WebP格式，建议尺寸500x500像素以上
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">取消</Button>
          <Button 
            onClick={handleSaveLocation} 
            variant="contained" 
            color="primary"
            disabled={!formData.name || uploadingImage}
          >
            {editingLocation ? '保存修改' : '添加位置'}
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

export default LocationsPage; 