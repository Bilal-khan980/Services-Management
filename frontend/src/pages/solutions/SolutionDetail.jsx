import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Divider,
  TextField,
  CircularProgress,
  Alert,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

// Status chip colors
const statusColors = {
  draft: 'default',
  published: 'success',
  archived: 'error',
};

const SolutionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [solution, setSolution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [addingComment, setAddingComment] = useState(false);
  
  const fetchSolution = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/solutions/${id}`);
      
      if (res.data.success) {
        setSolution(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch solution');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolution();
  }, [id]);

  const handleCommentChange = (e) => {
    setCommentText(e.target.value);
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    
    try {
      setAddingComment(true);
      
      // In a real app, you would have an API endpoint for adding comments
      // For now, we'll simulate it by updating the solution with a new comment
      const updatedComments = [
        ...(solution.comments || []),
        {
          _id: Date.now().toString(), // Temporary ID
          text: commentText,
          user: {
            _id: user._id,
            name: user.name,
          },
          createdAt: new Date().toISOString(),
        },
      ];
      
      const res = await api.put(`/solutions/${id}`, {
        comments: updatedComments,
      });
      
      if (res.data.success) {
        setSolution(res.data.data);
        setCommentText('');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add comment');
      console.error(err);
    } finally {
      setAddingComment(false);
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

  if (error) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard/solutions')}
          sx={{ mb: 3 }}
        >
          Back to Solutions
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!solution) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard/solutions')}
          sx={{ mb: 3 }}
        >
          Back to Solutions
        </Button>
        <Alert severity="info">Solution not found</Alert>
      </Box>
    );
  }

  const isAdmin = user.role === 'admin';
  const isAuthor = solution.author._id === user._id;
  const canEdit = isAdmin || isAuthor;

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/dashboard/solutions')}
        sx={{ mb: 3 }}
      >
        Back to Solutions
      </Button>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4">{solution.title}</Typography>
              {canEdit && (
                <Button
                  component="a"
                  href={`/dashboard/solutions/edit/${solution._id}`}
                  variant="outlined"
                  startIcon={<EditIcon />}
                >
                  Edit
                </Button>
              )}
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              <Chip
                label={solution.category.charAt(0).toUpperCase() + solution.category.slice(1)}
                color="primary"
                variant="outlined"
              />
              <Chip
                label={solution.status.charAt(0).toUpperCase() + solution.status.slice(1)}
                color={statusColors[solution.status] || 'default'}
              />
              {solution.tags && solution.tags.map((tag) => (
                <Chip key={tag} label={tag} size="small" />
              ))}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ mr: 1 }}>
                {solution.author.name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="subtitle2">
                  {solution.author.name}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {formatDate(solution.createdAt)}
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ mb: 4 }}>
              <ReactMarkdown>{solution.content}</ReactMarkdown>
            </Box>

            {solution.attachments && solution.attachments.length > 0 && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom>
                  Attachments
                </Typography>
                <List>
                  {solution.attachments.map((attachment) => (
                    <ListItem key={attachment._id}>
                      <ListItemAvatar>
                        <Avatar>
                          <AttachFileIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={attachment.name}
                        secondary={`Uploaded on ${formatDate(attachment.uploadedAt)}`}
                      />
                      <Button variant="outlined" size="small">
                        Download
                      </Button>
                    </ListItem>
                  ))}
                </List>
              </>
            )}

            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Comments
            </Typography>

            {solution.comments && solution.comments.length > 0 ? (
              <List>
                {solution.comments.map((comment) => (
                  <ListItem key={comment._id} alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar>
                        {comment.user.name.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle2">
                            {comment.user.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {formatDate(comment.createdAt)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          color="textPrimary"
                          sx={{ mt: 1, whiteSpace: 'pre-wrap' }}
                        >
                          {comment.text}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No comments yet. Be the first to comment!
              </Typography>
            )}

            <Box sx={{ mt: 3 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Add a comment..."
                value={commentText}
                onChange={handleCommentChange}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={addingComment ? <CircularProgress size={20} /> : <SendIcon />}
                  onClick={handleAddComment}
                  disabled={addingComment || !commentText.trim()}
                >
                  Add Comment
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default SolutionDetail;
