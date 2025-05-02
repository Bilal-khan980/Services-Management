import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Box, Typography, Button, CircularProgress } from '@mui/material';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Common Components
import ErrorBoundary from './components/common/ErrorBoundary';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Ticket Pages
import TicketList from './pages/tickets/TicketList';
import TicketCreate from './pages/tickets/TicketCreate';
import TicketDetail from './pages/tickets/TicketDetail';

// Change Pages
import ChangeList from './pages/changes/ChangeList';
import ChangeCreate from './pages/changes/ChangeCreate';
import ChangeDetail from './pages/changes/ChangeDetail';

// Knowledge Pages
import KnowledgeList from './pages/knowledge/KnowledgeList';
import KnowledgeCreate from './pages/knowledge/KnowledgeCreate';
import KnowledgeDetail from './pages/knowledge/KnowledgeDetail';

// Solution Pages
import SolutionList from './pages/solutions/SolutionList';
import SolutionCreate from './pages/solutions/SolutionCreate';
import SolutionDetail from './pages/solutions/SolutionDetail';

// Admin Pages
import UserList from './pages/admin/UserList';
import UserCreate from './pages/admin/UserCreate';
import UserEdit from './pages/admin/UserEdit';
import Settings from './pages/admin/Settings';

// Import permission utilities
import { hasRole, getAccessDeniedMessage } from './utils/permissions';
import PermissionGuard from './components/common/PermissionGuard';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [], requiredPermission = null }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Show a better loading indicator
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Make sure user data is loaded
  if (!user || !user.role) {
    return (
      <Box sx={{ p: 4, maxWidth: '600px', mx: 'auto', mt: 4 }}>
        <Typography variant="h5" color="error" gutterBottom>
          Error loading user data
        </Typography>
        <Typography variant="body1" paragraph>
          There was a problem loading your user information. Please try refreshing the page or logging in again.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.location.reload()}
        >
          Refresh Page
        </Button>
      </Box>
    );
  }

  // Check for role-based access
  if (allowedRoles.length > 0) {
    const hasAccess = allowedRoles.some(role => hasRole(user, role));
    if (!hasAccess) {
      return (
        <Navigate
          to="/dashboard"
          state={{
            accessDenied: true,
            message: `You need ${allowedRoles[0]} role or higher to access this page`
          }}
        />
      );
    }
  }

  // Check for permission-based access
  if (requiredPermission) {
    return (
      <PermissionGuard
        permission={requiredPermission}
        fallback={
          <Navigate
            to="/dashboard"
            state={{
              accessDenied: true,
              message: getAccessDeniedMessage(requiredPermission)
            }}
          />
        }
      >
        {children}
      </PermissionGuard>
    );
  }

  return children;
};

function App() {
  const { theme } = useTheme();
  const { loadUser } = useAuth();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <>
      <CssBaseline />
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<AuthLayout />}>
          <Route index element={<Navigate to="/login" />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password/:resetToken" element={<ResetPassword />} />
        </Route>

        {/* Main App Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />

          {/* Ticket Routes */}
          <Route path="tickets" element={<TicketList />} />
          <Route path="tickets/create" element={<TicketCreate />} />
          <Route path="tickets/:id" element={<TicketDetail />} />

          {/* Change Routes */}
          <Route path="changes" element={<ChangeList />} />
          <Route path="changes/create" element={<ChangeCreate />} />
          <Route path="changes/:id" element={<ChangeDetail />} />

          {/* Knowledge Routes */}
          <Route path="knowledge" element={
            <ErrorBoundary>
              <KnowledgeList />
            </ErrorBoundary>
          } />
          <Route
            path="knowledge/create"
            element={
              <ProtectedRoute allowedRoles={['editor', 'admin', 'enterprise_admin']}>
                <ErrorBoundary>
                  <KnowledgeCreate />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          />
          <Route path="knowledge/:id" element={
            <ErrorBoundary>
              <KnowledgeDetail />
            </ErrorBoundary>
          } />

          {/* Solution Routes */}
          <Route
            path="solutions"
            element={
              <ProtectedRoute allowedRoles={['editor', 'admin', 'enterprise_admin']}>
                <SolutionList />
              </ProtectedRoute>
            }
          />
          <Route
            path="solutions/create"
            element={
              <ProtectedRoute allowedRoles={['editor', 'admin', 'enterprise_admin']}>
                <SolutionCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="solutions/:id"
            element={
              <ProtectedRoute allowedRoles={['editor', 'admin', 'enterprise_admin']}>
                <SolutionDetail />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin', 'enterprise_admin']}>
                <UserList />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/users/create"
            element={
              <ProtectedRoute allowedRoles={['admin', 'enterprise_admin']}>
                <UserCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/users/:id"
            element={
              <ProtectedRoute allowedRoles={['admin', 'enterprise_admin']}>
                <UserEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/settings"
            element={
              <ProtectedRoute allowedRoles={['admin', 'enterprise_admin']}>
                <Settings />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
