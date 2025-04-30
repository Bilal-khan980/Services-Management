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
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

// Status chip colors
const statusColors = {
  draft: 'default',
  submitted: 'info',
  'under-review': 'warning',
  approved: 'success',
  rejected: 'error',
  implemented: 'secondary',
  closed: 'default',
};

// Impact chip colors
const impactColors = {
  low: 'success',
  medium: 'info',
  high: 'warning',
  critical: 'error',
};

const ChangeList = () => {
  const { user } = useAuth();
  const [changes, setChanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchChanges = async (page = 0, limit = 10, search = '') => {
    try {
      setLoading(true);
      
      let url = `/changes?page=${page + 1}&limit=${limit}`;
      
      if (search) {
        url += `&title[regex]=${search}&title[options]=i`;
      }
      
      const res = await api.get(url);
      
      setChanges(res.data.data);
      setTotalCount(res.data.pagination?.total || res.data.count);
      setError('');
    } catch (err) {
      setError('Failed to fetch changes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChanges(page, rowsPerPage, searchQuery);
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
        <Typography variant="h4">Changes</Typography>
        <Button
          component={RouterLink}
          to="/dashboard/changes/create"
          variant="contained"
          startIcon={<AddIcon />}
        >
          Create Change
        </Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          placeholder="Search changes by title..."
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
        ) : changes.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              No changes found. Create your first change request!
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Impact</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Planned Start</TableCell>
                    <TableCell>Planned End</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {changes.map((change) => (
                    <TableRow
                      key={change._id}
                      hover
                      component={RouterLink}
                      to={`/dashboard/changes/${change._id}`}
                      sx={{
                        textDecoration: 'none',
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: 'action.hover' },
                      }}
                    >
                      <TableCell>{change._id.slice(-6).toUpperCase()}</TableCell>
                      <TableCell>{change.title}</TableCell>
                      <TableCell>
                        <Chip
                          label={change.status.charAt(0).toUpperCase() + change.status.slice(1).replace('-', ' ')}
                          color={statusColors[change.status] || 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={change.impact.charAt(0).toUpperCase() + change.impact.slice(1)}
                          color={impactColors[change.impact] || 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {change.category.charAt(0).toUpperCase() + change.category.slice(1)}
                      </TableCell>
                      <TableCell>{formatDate(change.plannedStartDate)}</TableCell>
                      <TableCell>{formatDate(change.plannedEndDate)}</TableCell>
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
    </Box>
  );
};

export default ChangeList;
