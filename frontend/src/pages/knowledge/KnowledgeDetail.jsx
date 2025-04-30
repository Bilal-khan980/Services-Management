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
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
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

// Visibility chip colors
const visibilityColors = {
  public: 'success',
  internal: 'warning',
  private: 'error',
};

const KnowledgeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [addingComment, setAddingComment] = useState(false);
  const [voting, setVoting] = useState(false);
  
  const fetchArticle = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/knowledge/${id}`);
      
      if (res.data.success) {
        setArticle(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch article');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const handleCommentChange = (e) => {
    setCommentText(e.target.value);
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    
    try {
      setAddingComment(true);
      
      // In a real app, you would have an API endpoint for adding comments
      // For now, we'll simulate it by updating the article with a new comment
      const updatedComments = [
        ...(article.comments || []),
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
      
      const res = await api.put(`/knowledge/${id}`, {
        comments: updatedComments,
      });
      
      if (res.data.success) {
        setArticle(res.data.data);
        setCommentText('');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add comment');
      console.error(err);
    } finally {
      setAddingComment(false);
    }
  };

  const handleVote = async (voteType) => {
    try {
      setVoting(true);
      
      const res = await api.put(`/knowledge/${id}/vote`, {
        vote: voteType,
      });
      
      if (res.data.success) {
        setArticle(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to vote');
      console.error(err);
    } finally {
      setVoting(false);
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
          onClick={() => navigate('/dashboard/knowledge')}
          sx={{ mb: 3 }}
        >
          Back to Knowledge Base
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!article) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard/knowledge')}
          sx={{ mb: 3 }}
        >
          Back to Knowledge Base
        </Button>
        <Alert severity="info">Article not found</Alert>
      </Box>
    );
  }

  const isStaffOrAdmin = user.role === 'staff' || user.role === 'admin';
  const isAuthor = article.author._id === user._id;
  const canEdit = isStaffOrAdmin || isAuthor;
  
  // Check if user has already voted
  const userVote = article.votes?.voters?.find(voter => voter.user === user._id)?.vote;

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/dashboard/knowledge')}
        sx={{ mb: 3 }}
      >
        Back to Knowledge Base
      </Button>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4">{article.title}</Typography>
              {canEdit && (
                <Button
                  component="a"
                  href={`/dashboard/knowledge/edit/${article._id}`}
                  variant="outlined"
                  startIcon={<EditIcon />}
                >
                  Edit
                </Button>
              )}
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              <Chip
                label={article.category.charAt(0).toUpperCase() + article.category.slice(1)}
                color="primary"
                variant="outlined"
              />
              {isStaffOrAdmin && (
                <Chip
                  label={article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                  color={statusColors[article.status] || 'default'}
                />
              )}
              <Chip
                label={article.visibility.charAt(0).toUpperCase() + article.visibility.slice(1)}
                color={visibilityColors[article.visibility] || 'default'}
              />
              {article.tags && article.tags.map((tag) => (
                <Chip key={tag} label={tag} size="small" />
              ))}
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ mr: 1 }}>
                  {article.author.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2">
                    {article.author.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {formatDate(article.createdAt)}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                  color={userVote === 'up' ? 'primary' : 'default'}
                  onClick={() => handleVote('up')}
                  disabled={voting}
                >
                  <ThumbUpIcon />
                </IconButton>
                <Typography variant="body2" sx={{ mx: 1 }}>
                  {article.votes?.upvotes || 0}
                </Typography>
                <IconButton
                  color={userVote === 'down' ? 'error' : 'default'}
                  onClick={() => handleVote('down')}
                  disabled={voting}
                >
                  <ThumbDownIcon />
                </IconButton>
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {article.votes?.downvotes || 0}
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ mb: 4 }}>
              <ReactMarkdown>{article.content}</ReactMarkdown>
            </Box>

            {article.attachments && article.attachments.length > 0 && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom>
                  Attachments
                </Typography>
                <List>
                  {article.attachments.map((attachment) => (
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

            {article.comments && article.comments.length > 0 ? (
              <List>
                {article.comments.map((comment) => (
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

export default KnowledgeDetail;
