import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

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

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" />;
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
          <Route path="knowledge" element={<KnowledgeList />} />
          <Route
            path="knowledge/create"
            element={
              <ProtectedRoute allowedRoles={['staff', 'admin']}>
                <KnowledgeCreate />
              </ProtectedRoute>
            }
          />
          <Route path="knowledge/:id" element={<KnowledgeDetail />} />

          {/* Solution Routes */}
          <Route
            path="solutions"
            element={
              <ProtectedRoute allowedRoles={['staff', 'admin']}>
                <SolutionList />
              </ProtectedRoute>
            }
          />
          <Route
            path="solutions/create"
            element={
              <ProtectedRoute allowedRoles={['staff', 'admin']}>
                <SolutionCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="solutions/:id"
            element={
              <ProtectedRoute allowedRoles={['staff', 'admin']}>
                <SolutionDetail />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserList />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/users/create"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/users/:id"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserEdit />
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
