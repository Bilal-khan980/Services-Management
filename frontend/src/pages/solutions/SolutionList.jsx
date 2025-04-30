import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Pagination,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

// Status chip colors
const statusColors = {
  draft: 'default',
  published: 'success',
  archived: 'error',
};

const SolutionList = () => {
  const { user } = useAuth();
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const fetchSolutions = async (page = 1, limit = 9) => {
    try {
      setLoading(true);
      
      let url = `/solutions?page=${page}&limit=${limit}`;
      
      const res = await api.get(url);
      
      setSolutions(res.data.data);
      setTotalPages(Math.ceil(res.data.pagination?.total / limit) || 1);
      setError('');
    } catch (err) {
      setError('Failed to fetch solutions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolutions(page);
  }, [page]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      setSearching(true);
      
      // In a real app, you would have a search endpoint
      // For now, we'll simulate it by filtering solutions
      const res = await api.get(`/solutions?title[regex]=${searchQuery}&title[options]=i`);
      
      setSearchResults(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (!e.target.value.trim()) {
      setSearchResults([]);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
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
        <Typography variant="h4">Internal Solutions</Typography>
        <Button
          component={RouterLink}
          to="/dashboard/solutions/create"
          variant="contained"
          startIcon={<AddIcon />}
        >
          Create Solution
        </Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          placeholder="Search solutions..."
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton onClick={handleSearch} disabled={searching}>
                  {searching ? <CircularProgress size={20} /> : <SearchIcon />}
                </IconButton>
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

      {searchResults.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Search Results
          </Typography>
          <Grid container spacing={3}>
            {searchResults.map((solution) => (
              <Grid item xs={12} sm={6} md={4} key={solution._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Chip
                        size="small"
                        label={solution.category.charAt(0).toUpperCase() + solution.category.slice(1)}
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        size="small"
                        label={solution.status.charAt(0).toUpperCase() + solution.status.slice(1)}
                        color={statusColors[solution.status] || 'default'}
                      />
                    </Box>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {solution.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {solution.content.substring(0, 100)}...
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        By {solution.author.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(solution.createdAt)}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      component={RouterLink}
                      to={`/dashboard/solutions/${solution._id}`}
                      size="small"
                      startIcon={<VisibilityIcon />}
                    >
                      View
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={clearSearch}>Clear Results</Button>
          </Box>
        </Box>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : solutions.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No internal solutions found
          </Typography>
          <Button
            component={RouterLink}
            to="/dashboard/solutions/create"
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ mt: 2 }}
          >
            Create First Solution
          </Button>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {solutions.map((solution) => (
              <Grid item xs={12} sm={6} md={4} key={solution._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Chip
                        size="small"
                        label={solution.category.charAt(0).toUpperCase() + solution.category.slice(1)}
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        size="small"
                        label={solution.status.charAt(0).toUpperCase() + solution.status.slice(1)}
                        color={statusColors[solution.status] || 'default'}
                      />
                    </Box>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {solution.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {solution.content.substring(0, 100)}...
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        By {solution.author.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(solution.createdAt)}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      component={RouterLink}
                      to={`/dashboard/solutions/${solution._id}`}
                      size="small"
                      startIcon={<VisibilityIcon />}
                    >
                      View
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default SolutionList;
