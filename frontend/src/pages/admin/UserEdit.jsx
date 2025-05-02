import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  MenuItem,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const UserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
  });

  const [passwordData, setPasswordData] = useState({
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/users/${id}`);

      if (res.data.success) {
        setUserData(res.data.data);
        setFormData({
          name: res.data.data.name,
          email: res.data.data.email,
          role: res.data.data.role,
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch user');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setSuccess('');
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
    setPasswordSuccess('');
    setPasswordError('');
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setUpdating(true);
      setError('');

      const res = await api.put(`/users/${id}`, formData);

      if (res.data.success) {
        setSuccess('User updated successfully');
        setUserData(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update user');
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!passwordData.password) {
      setPasswordError('Password is required');
      return;
    }

    if (passwordData.password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    try {
      setUpdatingPassword(true);
      setPasswordError('');

      // In a real app, you would have a specific endpoint for admin password reset
      // For now, we'll use the user update endpoint
      const res = await api.put(`/users/${id}`, {
        password: passwordData.password,
      });

      if (res.data.success) {
        setPasswordSuccess('Password updated successfully');
        setPasswordData({ password: '' });
      }
    } catch (err) {
      setPasswordError(err.response?.data?.error || 'Failed to update password');
      console.error(err);
    } finally {
      setUpdatingPassword(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!userData) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard/admin/users')}
          sx={{ mb: 3 }}
        >
          Back to Users
        </Button>
        <Alert severity="error">User not found</Alert>
      </Box>
    );
  }

  // Prevent editing your own role (for security)
  const isSelfEdit = userData._id === currentUser._id;

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/dashboard/admin/users')}
        sx={{ mb: 3 }}
      >
        Back to Users
      </Button>

      <Typography variant="h4" gutterBottom>
        Edit User
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Update user information
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              User Information
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    select
                    required
                    fullWidth
                    label="Role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    disabled={isSelfEdit} // Prevent changing your own role
                    helperText={isSelfEdit ? "You cannot change your own role" : ""}
                  >
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="editor">Editor/Knowledge Manager</MenuItem>
                    <MenuItem value="staff">Staff</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                    {/* Only enterprise_admin can assign enterprise_admin role */}
                    {currentUser.role === 'enterprise_admin' && (
                      <MenuItem value="enterprise_admin">Enterprise Admin</MenuItem>
                    )}
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={updating ? <CircularProgress size={20} /> : <SaveIcon />}
                      disabled={updating}
                    >
                      Update User
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Reset Password
            </Typography>

            {passwordError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {passwordError}
              </Alert>
            )}

            {passwordSuccess && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {passwordSuccess}
              </Alert>
            )}

            <Box component="form" onSubmit={handlePasswordSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="New Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.password}
                    onChange={handlePasswordChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={toggleShowPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="secondary"
                      startIcon={updatingPassword ? <CircularProgress size={20} /> : <SaveIcon />}
                      disabled={updatingPassword}
                    >
                      Reset Password
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>

          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              User Details
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  User ID
                </Typography>
                <Typography variant="body2">{userData._id}</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Created At
                </Typography>
                <Typography variant="body2">{formatDate(userData.createdAt)}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserEdit;
