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

const KnowledgeCreate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams(); // Get the ID from the URL if editing
  const isEditMode = !!id; // Check if we're in edit mode

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'how-to',
    visibility: 'public',
    status: 'draft',
    tags: [],
  });

  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode); // Only set loading if in edit mode
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch article data if in edit mode
  useEffect(() => {
    const fetchArticle = async () => {
      if (!isEditMode) return; // Skip if not in edit mode

      try {
        setFetchLoading(true);
        const res = await api.get(`/knowledge/${id}`);

        if (res.data.success) {
          const article = res.data.data;
          setFormData({
            title: article.title || '',
            content: article.content || '',
            category: article.category || 'how-to',
            visibility: article.visibility || 'public',
            status: article.status || 'draft',
            tags: article.tags || [],
          });
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch article');
        console.error(err);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchArticle();
  }, [id, isEditMode]);

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
      setError('');
      setSuccess('');

      let res;

      if (isEditMode) {
        // Update existing article
        res = await api.put(`/knowledge/${id}`, formData);
        if (res.data.success) {
          setSuccess('Article updated successfully');
          // Wait a moment to show the success message before navigating
          setTimeout(() => {
            navigate(`/dashboard/knowledge/${id}`);
          }, 1500);
        }
      } else {
        // Create new article
        res = await api.post('/knowledge', formData);
        if (res.data.success) {
          navigate(`/dashboard/knowledge/${res.data.data._id}`);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || (isEditMode ? 'Failed to update article' : 'Failed to create article'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {fetchLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Typography variant="h4" gutterBottom>
            {isEditMode ? 'Edit Knowledge Article' : 'Create Knowledge Article'}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary" gutterBottom>
            {isEditMode ? 'Update your knowledge article' : 'Share your knowledge with the team'}
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
        </>
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
                placeholder="Article title"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
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
                <MenuItem value="how-to">How-To</MenuItem>
                <MenuItem value="faq">FAQ</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                select
                required
                fullWidth
                label="Visibility"
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
              >
                <MenuItem value="public">Public (All Users)</MenuItem>
                <MenuItem value="internal">Internal (Staff Only)</MenuItem>
                <MenuItem value="private">Private (Only You)</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
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
                placeholder="Write your article content here. You can use markdown formatting."
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="button"
                  variant="outlined"
                  sx={{ mr: 2 }}
                  onClick={() => isEditMode ? navigate(`/dashboard/knowledge/${id}`) : navigate('/dashboard/knowledge')}
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
                  {isEditMode
                    ? (formData.status === 'draft' ? 'Save Changes as Draft' : 'Update Published Article')
                    : (formData.status === 'draft' ? 'Save as Draft' : 'Publish Article')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default KnowledgeCreate;
