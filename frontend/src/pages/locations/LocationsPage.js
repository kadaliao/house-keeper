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
  TreeView,
  TreeItem
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  LocationOn as LocationIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon
} from '@mui/icons-material';

import { getLocations, createLocation, updateLocation, deleteLocation } from '../../services/locations';

const LocationsPage = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [expanded, setExpanded] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_id: ''
  });

  // 获取所有位置
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const locationsData = await getLocations();
        setLocations(locationsData);
        setError(null);
      } catch (err) {
        console.error('获取位置数据失败:', err);
        setError('获取位置数据失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

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
      parent_id: parentId
    });
    setOpenDialog(true);
  };

  // 打开编辑位置对话框
  const handleOpenEditDialog = (location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      description: location.description || '',
      parent_id: location.parent_id || ''
    });
    setOpenDialog(true);
  };

  // 关闭对话框
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // 保存位置
  const handleSaveLocation = async () => {
    try {
      setLoading(true);
      
      // 验证必填字段
      if (!formData.name) {
        setSnackbar({
          open: true,
          message: '位置名称不能为空',
          severity: 'error'
        });
        setLoading(false);
        return;
      }

      const locationData = {
        ...formData,
        parent_id: formData.parent_id || null
      };

      let savedLocation;
      
      if (editingLocation) {
        // 更新位置
        savedLocation = await updateLocation(editingLocation.id, locationData);
        setSnackbar({
          open: true,
          message: '位置更新成功',
          severity: 'success'
        });
      } else {
        // 创建新位置
        savedLocation = await createLocation(locationData);
        setSnackbar({
          open: true,
          message: '位置添加成功',
          severity: 'success'
        });
      }

      // 更新位置列表
      const fetchLocations = async () => {
        const locationsData = await getLocations();
        setLocations(locationsData);
      };
      await fetchLocations();

      handleCloseDialog();
    } catch (err) {
      console.error('保存位置失败:', err);
      setSnackbar({
        open: true,
        message: '保存位置失败，请稍后重试',
        severity: 'error'
      });
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

  // 构建位置树形结构
  const buildLocationTree = (parentId = null) => {
    return locations
      .filter(location => location.parent_id === parentId)
      .map(location => {
        const children = buildLocationTree(location.id);
        return {
          ...location,
          children: children.length > 0 ? children : []
        };
      });
  };

  // 渲染位置树形节点
  const renderTreeNodes = (nodes) => {
    return nodes.map((node) => (
      <TreeItem 
        key={node.id} 
        nodeId={node.id.toString()} 
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body1">{node.name}</Typography>
            </Box>
            <Box>
              <Tooltip title="添加子位置">
                <IconButton 
                  size="small" 
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenAddDialog(node.id);
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
                    handleOpenEditDialog(node);
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
                    handleDeleteLocation(node.id);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        }
      >
        {node.children.length > 0 && renderTreeNodes(node.children)}
      </TreeItem>
    ));
  };

  // 获取位置树
  const locationTree = buildLocationTree(null);

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
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenAddDialog()}
          >
            添加顶级位置
          </Button>
        </Box>

        {/* 错误提示 */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* 位置树形结构 */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : locations.length === 0 ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            暂无位置数据，请点击"添加顶级位置"按钮添加
          </Alert>
        ) : (
          <Card variant="outlined" sx={{ mt: 2 }}>
            <CardContent>
              <TreeView
                defaultCollapseIcon={<ExpandMoreIcon />}
                defaultExpandIcon={<ChevronRightIcon />}
                expanded={expanded}
                onNodeToggle={handleToggle}
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
              </TreeView>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* 添加/编辑位置对话框 */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingLocation ? '编辑位置' : '添加位置'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="位置名称"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
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
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
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
                  {locations
                    .filter(loc => !editingLocation || loc.id !== editingLocation.id)
                    .map((location) => (
                      <MenuItem key={location.id} value={location.id}>
                        {location.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            取消
          </Button>
          <Button 
            onClick={handleSaveLocation} 
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

export default LocationsPage; 