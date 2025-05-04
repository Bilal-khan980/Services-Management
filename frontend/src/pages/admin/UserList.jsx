import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

// Role chip colors
const roleColors = {
  user: 'primary',
  editor: 'info',
  staff: 'secondary',
  admin: 'error',
  enterprise_admin: 'warning',
};

const UserList = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async (page = 0, limit = 10, search = '') => {
    try {
      setLoading(true);

      let url = `/users?page=${page + 1}&limit=${limit}`;

      if (search) {
        url += `&name[regex]=${search}&name[options]=i`;
      }

      const res = await api.get(url);

      setUsers(res.data.data);
      setTotalCount(res.data.pagination?.total || res.data.count);
      setError('');
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page, rowsPerPage, searchQuery);
  }, [page, rowsPerPage, searchQuery]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(0);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setPage(0);
  };

  const handleDeleteClick = (userToDelete) => {
    setUserToDelete(userToDelete);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    // Prevent admin users from deleting other admins or enterprise admins
    // Enterprise admins can delete any user
    if (user.role === 'admin' &&
        (userToDelete.role === 'admin' || userToDelete.role === 'enterprise_admin')) {
      setError('Admin users cannot delete other Admin or Enterprise Admin users');
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      setDeleting(false);
      return;
    }

    try {
      setDeleting(true);
      await api.delete(`/users/${userToDelete._id}`);

      // Refresh the user list
      fetchUsers(page, rowsPerPage, searchQuery);

      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (err) {
      setError('Failed to delete user');
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">User Management</Typography>
        <Button
          component={RouterLink}
          to="/dashboard/admin/users/create"
          variant="contained"
          startIcon={<AddIcon />}
        >
          Create User
        </Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          placeholder="Search users by name..."
          value={searchQuery}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton onClick={clearSearch} edge="end">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : users.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              No users found.
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((userData) => (
                    <TableRow key={userData._id} hover>
                      <TableCell>{userData.name}</TableCell>
                      <TableCell>{userData.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
                          color={roleColors[userData.role] || 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(userData.createdAt)}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <IconButton
                            component={RouterLink}
                            to={`/dashboard/admin/users/${userData._id}`}
                            color="primary"
                            size="small"
                            sx={{ mr: 1 }}
                            disabled={
                              // Disable editing for admin users when viewing other admins or enterprise admins
                              // Enterprise admins can edit any user
                              user.role === 'admin' &&
                              (userData.role === 'admin' || userData.role === 'enterprise_admin') &&
                              userData._id !== user._id
                            }
                            title={
                              user.role === 'admin' &&
                              (userData.role === 'admin' || userData.role === 'enterprise_admin') &&
                              userData._id !== user._id
                                ? "Admin users cannot edit other admins or enterprise admins"
                                : "Edit user"
                            }
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleDeleteClick(userData)}
                            disabled={
                              userData._id === user._id || // Prevent deleting yourself
                              (user.role === 'admin' &&
                               (userData.role === 'admin' || userData.role === 'enterprise_admin')) // Prevent admin from deleting other admins or enterprise admins
                              // Enterprise admins can delete any user except themselves
                            }
                            title={
                              userData._id === user._id ?
                                "You cannot delete your own account" :
                              (user.role === 'admin' &&
                               (userData.role === 'admin' || userData.role === 'enterprise_admin')) ?
                                "Admin users cannot delete other Admin or Enterprise Admin users" :
                                "Delete user"
                            }
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the user "{userToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={20} /> : null}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserList;
