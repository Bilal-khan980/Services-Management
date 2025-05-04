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

  // Check if current admin user is trying to edit another admin or enterprise admin
  // Enterprise admins can edit any user
  const cannotEditUser =
    currentUser.role === 'admin' &&
    userData &&
    (userData.role === 'admin' || userData.role === 'enterprise_admin') &&
    userData._id !== currentUser._id;

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

      // Prevent admin users from editing other admins or enterprise admins
      // Enterprise admins can edit any user
      if (cannotEditUser) {
        setError('Admin users cannot edit other Admin or Enterprise Admin users');
        setUpdating(false);
        return;
      }

      // Prevent admin users from changing roles to admin, staff, or enterprise_admin
      // Enterprise admins can assign any role
      if (currentUser.role !== 'enterprise_admin' &&
          userData.role !== formData.role &&
          (formData.role === 'admin' || formData.role === 'staff' || formData.role === 'enterprise_admin')) {
        setError('You do not have permission to assign this role. Only Enterprise Admins can assign Admin, Staff, or Enterprise Admin roles.');
        setUpdating(false);
        return;
      }

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

    // Prevent admin users from resetting passwords for other admins or enterprise admins
    // Enterprise admins can reset any user's password
    if (cannotEditUser) {
      setPasswordError('Admin users cannot reset passwords for other Admin or Enterprise Admin users');
      return;
    }

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

            {cannotEditUser && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                As an Admin, you cannot edit other Admin or Enterprise Admin users. You can only view their information.
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
                    disabled={cannotEditUser}
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
                    disabled={cannotEditUser}
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
                    disabled={isSelfEdit || cannotEditUser} // Prevent changing your own role or other admin/enterprise roles
                    helperText={isSelfEdit ? "You cannot change your own role" :
                               cannotEditUser ? "Admin users cannot edit other Admin or Enterprise Admin users" :
                               (currentUser.role !== 'enterprise_admin' &&
                                (formData.role === 'admin' || formData.role === 'staff' || formData.role === 'enterprise_admin')) ?
                                "You cannot change this user's role as it requires enterprise admin privileges" : ""}
                  >
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="editor">Editor/Knowledge Manager</MenuItem>

                    {/* Only show staff and admin options if current user is enterprise_admin or if the user being edited already has that role */}
                    {(currentUser.role === 'enterprise_admin' || formData.role === 'staff') && (
                      <MenuItem value="staff">Staff</MenuItem>
                    )}

                    {(currentUser.role === 'enterprise_admin' || formData.role === 'admin') && (
                      <MenuItem value="admin">Admin</MenuItem>
                    )}

                    {/* Only enterprise_admin can assign enterprise_admin role */}
                    {(currentUser.role === 'enterprise_admin' || formData.role === 'enterprise_admin') && (
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
                      disabled={updating || cannotEditUser}
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

            {cannotEditUser && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                As an Admin, you cannot reset passwords for other Admin or Enterprise Admin users.
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
                    disabled={cannotEditUser}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={toggleShowPassword}
                            edge="end"
                            disabled={cannotEditUser}
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
                      disabled={updatingPassword || cannotEditUser}
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
