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
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

// Status chip colors
const statusColors = {
  draft: 'default',
  published: 'success',
  archived: 'error',
};

// Visibility chip colors
const visibilityColors = {
  public: 'success',
  internal: 'warning',
  private: 'error',
};

const KnowledgeList = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const fetchArticles = async (page = 1, limit = 9) => {
    try {
      setLoading(true);
      
      let url = `/knowledge?page=${page}&limit=${limit}`;
      
      // If user is not staff/admin, only show published articles
      if (user.role !== 'admin' && user.role !== 'staff') {
        url += '&status=published';
      }
      
      const res = await api.get(url);
      
      setArticles(res.data.data);
      setTotalPages(Math.ceil(res.data.pagination?.total / limit) || 1);
      setError('');
    } catch (err) {
      setError('Failed to fetch knowledge articles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles(page);
  }, [page, user.role]);

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
      // For now, we'll simulate it by filtering articles
      const res = await api.get(`/knowledge/suggest?keywords=${searchQuery}`);
      
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

  const isStaffOrAdmin = user.role === 'staff' || user.role === 'admin';

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Knowledge Base</Typography>
        {isStaffOrAdmin && (
          <Button
            component={RouterLink}
            to="/dashboard/knowledge/create"
            variant="contained"
            startIcon={<AddIcon />}
          >
            Create Article
          </Button>
        )}
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          placeholder="Search knowledge base..."
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
            {searchResults.map((article) => (
              <Grid item xs={12} sm={6} md={4} key={article._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Chip
                        size="small"
                        label={article.category.charAt(0).toUpperCase() + article.category.slice(1)}
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        size="small"
                        label={article.visibility.charAt(0).toUpperCase() + article.visibility.slice(1)}
                        color={visibilityColors[article.visibility] || 'default'}
                      />
                    </Box>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {article.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {article.content.substring(0, 100)}...
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        By {article.author.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(article.createdAt)}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      component={RouterLink}
                      to={`/dashboard/knowledge/${article._id}`}
                      size="small"
                      startIcon={<VisibilityIcon />}
                    >
                      View
                    </Button>
                    <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                      <ThumbUpIcon fontSize="small" color="action" />
                      <Typography variant="caption" sx={{ mx: 0.5 }}>
                        {article.votes?.upvotes || 0}
                      </Typography>
                      <ThumbDownIcon fontSize="small" color="action" />
                      <Typography variant="caption" sx={{ ml: 0.5 }}>
                        {article.votes?.downvotes || 0}
                      </Typography>
                    </Box>
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
      ) : articles.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No knowledge articles found
          </Typography>
          {isStaffOrAdmin && (
            <Button
              component={RouterLink}
              to="/dashboard/knowledge/create"
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ mt: 2 }}
            >
              Create First Article
            </Button>
          )}
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {articles.map((article) => (
              <Grid item xs={12} sm={6} md={4} key={article._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Chip
                        size="small"
                        label={article.category.charAt(0).toUpperCase() + article.category.slice(1)}
                        color="primary"
                        variant="outlined"
                      />
                      <Box>
                        {isStaffOrAdmin && (
                          <Chip
                            size="small"
                            label={article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                            color={statusColors[article.status] || 'default'}
                            sx={{ mr: 0.5 }}
                          />
                        )}
                        <Chip
                          size="small"
                          label={article.visibility.charAt(0).toUpperCase() + article.visibility.slice(1)}
                          color={visibilityColors[article.visibility] || 'default'}
                        />
                      </Box>
                    </Box>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {article.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {article.content.substring(0, 100)}...
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        By {article.author.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(article.createdAt)}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      component={RouterLink}
                      to={`/dashboard/knowledge/${article._id}`}
                      size="small"
                      startIcon={<VisibilityIcon />}
                    >
                      View
                    </Button>
                    <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                      <ThumbUpIcon fontSize="small" color="action" />
                      <Typography variant="caption" sx={{ mx: 0.5 }}>
                        {article.votes?.upvotes || 0}
                      </Typography>
                      <ThumbDownIcon fontSize="small" color="action" />
                      <Typography variant="caption" sx={{ ml: 0.5 }}>
                        {article.votes?.downvotes || 0}
                      </Typography>
                    </Box>
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

export default KnowledgeList;
