import {
    ArrowBack as ArrowBackIcon,
    AttachFile as AttachFileIcon,
    Edit as EditIcon,
    Send as SendIcon,
} from '@mui/icons-material';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    Grid,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Paper,
    TextField,
    Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
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
  // Handle the case when author is just an ID string or null
  const authorId = typeof solution.author === 'object' && solution.author ?
    solution.author._id :
    (solution.author || '');
  const isAuthor = authorId && authorId === user._id;
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
                  component={RouterLink}
                  to={`/dashboard/solutions/edit/${solution._id}`}
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
                {typeof solution.author === 'object' && solution.author?.name
                  ? solution.author.name.charAt(0)
                  : 'U'}
              </Avatar>
              <Box>
                <Typography variant="subtitle2">
                  {typeof solution.author === 'object' && solution.author?.name
                    ? solution.author.name
                    : 'Unknown Author'}
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
                      <Button
                        variant="outlined"
                        size="small"
                        component="a"
                        href={`http://localhost:9999${attachment.path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
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
                        {typeof comment.user === 'object' && comment.user?.name
                          ? comment.user.name.charAt(0)
                          : 'U'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle2">
                            {typeof comment.user === 'object' && comment.user?.name
                              ? comment.user.name
                              : 'Unknown User'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {formatDate(comment.createdAt || new Date())}
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
