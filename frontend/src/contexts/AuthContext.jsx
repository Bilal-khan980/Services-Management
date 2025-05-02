import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Check if we're in a browser environment (not server-side rendering)
        if (typeof window !== 'undefined') {
          const storedToken = localStorage.getItem('token');
          if (storedToken) {
            setToken(storedToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Load user data
  const loadUser = useCallback(async () => {
    try {
      if (!token) {
        console.log('No token available, skipping user load');
        setLoading(false);
        return;
      }

      console.log('Loading user data with token:', token.substring(0, 10) + '...');

      // Set the token in the headers for this request
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const res = await api.get('/auth/me');
      console.log('User data loaded:', res.data.data);
      setUser(res.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading user:', error);
      // Only logout if it's an authentication error
      if (error.response && error.response.status === 401) {
        console.log('Authentication error, logging out');
        logout();
      }
      setLoading(false);
    }
  }, [token]);

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/register', userData);

      if (res.data.success) {
        const { token } = res.data;

        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
        }

        // Set token in state and axios headers
        setToken(token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Load user data
        await loadUser();

        toast.success('Registration successful!');
        navigate('/dashboard');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Registration failed');
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/login', { email, password });

      if (res.data.success) {
        const { token } = res.data;

        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
        }

        // Set token in state and axios headers
        setToken(token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Load user data
        await loadUser();

        toast.success('Login successful!');
        navigate('/dashboard');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Login failed');
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = useCallback(() => {
    // Remove from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }

    // Clear state and axios headers
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];

    // Redirect to login
    navigate('/login');
  }, [navigate]);

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      const res = await api.put('/auth/updatedetails', userData);

      if (res.data.success) {
        setUser(res.data.data);
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Update failed');
      toast.error(error.response?.data?.error || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  // Update password
  const updatePassword = async (passwordData) => {
    try {
      setLoading(true);
      const res = await api.put('/auth/updatepassword', passwordData);

      if (res.data.success) {
        toast.success('Password updated successfully!');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Password update failed');
      toast.error(error.response?.data?.error || 'Password update failed');
    } finally {
      setLoading(false);
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/forgotpassword', { email });

      if (res.data.success) {
        toast.success('Password reset email sent!');
        return true;
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to send reset email');
      toast.error(error.response?.data?.error || 'Failed to send reset email');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (resetToken, password) => {
    try {
      setLoading(true);
      const res = await api.put(`/auth/resetpassword/${resetToken}`, { password });

      if (res.data.success) {
        toast.success('Password reset successful!');
        navigate('/login');
        return true;
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Password reset failed');
      toast.error(error.response?.data?.error || 'Password reset failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token,
    register,
    login,
    logout,
    loadUser,
    updateProfile,
    updatePassword,
    forgotPassword,
    resetPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
