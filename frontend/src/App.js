import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { zhCN } from '@mui/material/locale';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import zhLocale from 'date-fns/locale/zh-CN';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useTheme } from './contexts/ThemeContext';
import { ReminderProvider } from './contexts/ReminderContext';

// Layouts
import MainLayout from './components/layout/MainLayout';

// Pages
import Home from './pages/Home';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ItemsPage from './pages/items/ItemsPage';
import LocationsPage from './pages/locations/LocationsPage';
import RemindersPage from './pages/reminders/RemindersPage';
import SettingsPage from './pages/settings/SettingsPage';
import ProfilePage from './pages/profile/ProfilePage';
import ProtectedRoute from './components/common/ProtectedRoute';

// 创建主题函数
const createAppTheme = (mode) => createTheme(
  {
    palette: {
      mode,
      primary: {
        main: '#2E7D32', // 绿色主题，代表家庭、自然
        light: '#4CAF50',
        dark: '#1B5E20',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: '#FF8F00', // 温暖的橙色作为辅助色
        light: '#FFB74D',
        dark: '#EF6C00',
        contrastText: '#FFFFFF',
      },
      background: {
        default: mode === 'light' ? '#F9FAFB' : '#121212',
        paper: mode === 'light' ? '#FFFFFF' : '#1E1E1E',
      },
      success: {
        main: '#4CAF50',
        light: '#81C784',
        dark: '#388E3C',
      },
      error: {
        main: '#F44336',
        light: '#E57373',
        dark: '#D32F2F',
      },
      warning: {
        main: '#FF9800',
        light: '#FFB74D',
        dark: '#F57C00',
      },
      info: {
        main: '#03A9F4',
        light: '#4FC3F7',
        dark: '#0288D1',
      },
      divider: mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)',
      text: {
        primary: mode === 'light' ? '#212121' : '#E0E0E0',
        secondary: mode === 'light' ? '#5C5C5C' : '#A0A0A0',
        disabled: mode === 'light' ? 'rgba(0, 0, 0, 0.38)' : 'rgba(255, 255, 255, 0.38)',
      },
    },
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Noto Sans SC"',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(','),
      h1: {
        fontWeight: 600,
        fontSize: '2.5rem',
      },
      h2: {
        fontWeight: 600,
        fontSize: '2rem',
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.75rem',
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.5rem',
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.25rem',
      },
      h6: {
        fontWeight: 600,
        fontSize: '1.125rem',
      },
      subtitle1: {
        fontSize: '1rem',
        fontWeight: 500,
      },
      subtitle2: {
        fontSize: '0.875rem',
        fontWeight: 500,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
      },
      button: {
        fontWeight: 500,
        textTransform: 'none',
      },
    },
    shape: {
      borderRadius: 8,
    },
    shadows: [
      'none',
      '0px 2px 4px rgba(0, 0, 0, 0.05)',
      '0px 4px 8px rgba(0, 0, 0, 0.05)',
      '0px 8px 16px rgba(0, 0, 0, 0.05)',
      '0px 16px 24px rgba(0, 0, 0, 0.05)',
      '0px 24px 32px rgba(0, 0, 0, 0.05)',
      '0px 32px 40px rgba(0, 0, 0, 0.05)',
      '0px 40px 48px rgba(0, 0, 0, 0.05)',
      '0px 48px 56px rgba(0, 0, 0, 0.05)',
      '0px 56px 64px rgba(0, 0, 0, 0.05)',
      '0px 64px 72px rgba(0, 0, 0, 0.05)',
      '0px 72px 80px rgba(0, 0, 0, 0.05)',
      '0px 80px 88px rgba(0, 0, 0, 0.05)',
      '0px 88px 96px rgba(0, 0, 0, 0.05)',
      '0px 96px 104px rgba(0, 0, 0, 0.05)',
      '0px 104px 112px rgba(0, 0, 0, 0.05)',
      '0px 112px 120px rgba(0, 0, 0, 0.05)',
      '0px 120px 128px rgba(0, 0, 0, 0.05)',
      '0px 128px 136px rgba(0, 0, 0, 0.05)',
      '0px 136px 144px rgba(0, 0, 0, 0.05)',
      '0px 144px 152px rgba(0, 0, 0, 0.05)',
      '0px 152px 160px rgba(0, 0, 0, 0.05)',
      '0px 160px 168px rgba(0, 0, 0, 0.05)',
      '0px 168px 176px rgba(0, 0, 0, 0.05)',
    ],
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 16px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
            },
          },
          contained: {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0px 12px 24px rgba(0, 0, 0, 0.1)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: 'none',
            boxShadow: '4px 0px 12px rgba(0, 0, 0, 0.05)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
    },
  },
  zhCN // 使用中文语言包
);

// AppContent组件，使用ThemeContext的值来动态创建主题
function AppContent() {
  const { mode } = useTheme();
  const theme = React.useMemo(() => createAppTheme(mode), [mode]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhLocale}>
        <AuthProvider>
          <ReminderProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <DashboardPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/items" 
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <ItemsPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/locations" 
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <LocationsPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/reminders" 
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <RemindersPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <SettingsPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <ProfilePage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Router>
          </ReminderProvider>
        </AuthProvider>
      </LocalizationProvider>
    </MuiThemeProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App; 