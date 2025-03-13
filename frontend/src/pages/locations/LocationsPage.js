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
  Collapse
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
  FolderOpen as FolderOpenIcon
} from '@mui/icons-material';
import { useLocation } from 'react-router-dom';

import { getLocations, createLocation, updateLocation, deleteLocation } from '../../services/locations';

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
    parent_id: ''
  });

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const selectedLocationId = queryParams.get('selected');

  // 获取所有位置
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const locationsData = await getLocations();
        
        // 确保每个位置都有ID，对数据进行预处理
        const processedData = locationsData.map((loc, index) => {
          if (!loc.id) {
            console.warn('发现没有ID的位置项:', loc);
            // 使用随机字符串确保ID不会重复
            return { ...loc, id: `missing-id-${index}-${Math.random().toString(36).substring(2, 10)}` };
          }
          return loc;
        });
        
        setLocations(processedData);
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
      parent_id: parentId || ''
    });
    setOpenDialog(true);
  };

  // 打开编辑位置对话框
  const handleOpenEditDialog = (location) => {
    if (!location || !location.id) {
      console.error('无效的位置对象:', location);
      setSnackbar({
        open: true,
        message: '无法编辑位置，无效的位置数据',
        severity: 'error'
      });
      return;
    }
    
    setEditingLocation(location);
    setFormData({
      name: location.name || '',
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

      // 确保parent_id是有效值或null
      const locationData = {
        ...formData,
        parent_id: formData.parent_id && formData.parent_id !== '' ? formData.parent_id : null
      };

      console.log('保存位置数据:', locationData);
      
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
        try {
          const locationsData = await getLocations();
          
          // 确保每个位置都有ID，对数据进行预处理
          const processedData = locationsData.map((loc, index) => {
            if (!loc.id) {
              console.warn('发现没有ID的位置项:', loc);
              // 生成唯一ID，避免ID冲突
              return { ...loc, id: `missing-id-${index}-${Math.random().toString(36).substring(2, 10)}` };
            }
            return loc;
          });
          
          setLocations(processedData);
        } catch (err) {
          console.error('刷新位置列表失败:', err);
          setSnackbar({
            open: true,
            message: '刷新位置列表失败，请刷新页面重试',
            severity: 'error'
          });
        }
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