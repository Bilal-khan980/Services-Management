import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Chip,
  InputAdornment,
} from '@mui/material';
import { Send as SendIcon, Add as AddIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const SolutionEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'process',
    status: 'draft',
    tags: [],
  });
  
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch the solution data
  useEffect(() => {
    const fetchSolution = async () => {
      try {
        setFetchLoading(true);
        const res = await api.get(`/solutions/${id}`);
        
        if (res.data.success) {
          const solution = res.data.data;
          setFormData({
            title: solution.title || '',
            content: solution.content || '',
            category: solution.category || 'process',
            status: solution.status || 'draft',
            tags: solution.tags || [],
          });
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch solution');
        console.error(err);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchSolution();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleDeleteTag = (tagToDelete) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToDelete),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const res = await api.put(`/solutions/${id}`, formData);
      
      if (res.data.success) {
        navigate(`/dashboard/solutions/${res.data.data._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update solution');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Edit Internal Solution
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Update internal procedures and solutions for staff
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mt: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Solution title"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                select
                required
                fullWidth
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <MenuItem value="hardware">Hardware</MenuItem>
                <MenuItem value="software">Software</MenuItem>
                <MenuItem value="network">Network</MenuItem>
                <MenuItem value="security">Security</MenuItem>
                <MenuItem value="process">Process</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                select
                required
                fullWidth
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tags"
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyPress={handleTagKeyPress}
                placeholder="Add tags and press Enter"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button onClick={handleAddTag} disabled={!tagInput.trim()}>
                        <AddIcon />
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {formData.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleDeleteTag(tag)}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={15}
                label="Content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Write your solution content here. You can use markdown formatting."
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="button"
                  variant="outlined"
                  sx={{ mr: 2 }}
                  onClick={() => navigate(`/dashboard/solutions/${id}`)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                  disabled={loading}
                >
                  {formData.status === 'draft' ? 'Save as Draft' : 'Update Solution'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default SolutionEdit;
