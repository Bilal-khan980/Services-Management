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
  MenuItem,
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
  Save as SaveIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

// Status chip colors
const statusColors = {
  new: 'info',
  assigned: 'secondary',
  'in-progress': 'warning',
  'on-hold': 'error',
  resolved: 'success',
  closed: 'default',
};

// Priority chip colors
const priorityColors = {
  low: 'success',
  medium: 'info',
  high: 'warning',
  critical: 'error',
};

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [addingComment, setAddingComment] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    status: '',
    priority: '',
    category: '',
    assignedTo: '',
  });

  const fetchTicket = async () => {
    try {
      setLoading(true);
      setError(''); // Clear any previous errors

      // Check if id is valid
      if (!id) {
        setError('Invalid ticket ID');
        setLoading(false);
        return;
      }

      const res = await api.get(`/tickets/${id}`);

      if (res.data.success) {
        setTicket(res.data.data);
        setEditData({
          status: res.data.data.status,
          priority: res.data.data.priority,
          category: res.data.data.category,
          assignedTo: res.data.data.assignedTo?._id || '',
        });
      }
    } catch (err) {
      console.error('Error fetching ticket:', err);

      // Handle specific error cases
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (err.response.status === 404) {
          setError('Ticket not found');
        } else if (err.response.status === 401) {
          setError('You are not authorized to view this ticket');
          // Auth context will handle the redirect
        } else {
          setError(err.response.data?.error || `Server error: ${err.response.status}`);
        }
      } else if (err.request) {
        // The request was made but no response was received
        setError('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError('Failed to fetch ticket: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateTicket = async () => {
    try {
      setUpdating(true);
      const res = await api.put(`/tickets/${id}`, editData);

      if (res.data.success) {
        setTicket(res.data.data);
        setEditMode(false);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update ticket');
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleCommentChange = (e) => {
    setCommentText(e.target.value);
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      setAddingComment(true);

      // In a real app, you would have an API endpoint for adding comments
      // For now, we'll simulate it by updating the ticket with a new comment
      const updatedComments = [
        ...(ticket.comments || []),
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

      const res = await api.put(`/tickets/${id}`, {
        comments: updatedComments,
      });

      if (res.data.success) {
        setTicket(res.data.data);
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
          onClick={() => navigate('/dashboard/tickets')}
          sx={{ mb: 3 }}
        >
          Back to Tickets
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!ticket) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard/tickets')}
          sx={{ mb: 3 }}
        >
          Back to Tickets
        </Button>
        <Alert severity="info">Ticket not found</Alert>
      </Box>
    );
  }

  const isStaffOrAdmin = user.role === 'staff' || user.role === 'admin' || user.role === 'enterprise_admin';
  const isEditor = user.role === 'editor';
  const isTicketOwner = ticket.user._id === user._id;
  const canEdit = isStaffOrAdmin || isTicketOwner || isEditor;

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/dashboard/tickets')}
        sx={{ mb: 3 }}
      >
        Back to Tickets
      </Button>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5">
                Ticket #{ticket._id.slice(-6).toUpperCase()}: {ticket.title}
              </Typography>
              {canEdit && !editMode && (
                <Button
                  variant="outlined"
                  onClick={() => setEditMode(true)}
                >
                  Edit
                </Button>
              )}
              {editMode && (
                <Box>
                  <Button
                    variant="outlined"
                    onClick={() => setEditMode(false)}
                    sx={{ mr: 1 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={updating ? <CircularProgress size={20} /> : <SaveIcon />}
                    onClick={handleUpdateTicket}
                    disabled={updating}
                  >
                    Save
                  </Button>
                </Box>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" color="textSecondary">
              Status
            </Typography>
            {editMode && isStaffOrAdmin ? (
              <TextField
                select
                fullWidth
                name="status"
                value={editData.status}
                onChange={handleEditChange}
                margin="dense"
                size="small"
              >
                <MenuItem value="new">New</MenuItem>
                <MenuItem value="assigned">Assigned</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="on-hold">On Hold</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </TextField>
            ) : (
              <Chip
                label={ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                color={statusColors[ticket.status] || 'default'}
              />
            )}
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" color="textSecondary">
              Priority
            </Typography>
            {editMode ? (
              <TextField
                select
                fullWidth
                name="priority"
                value={editData.priority}
                onChange={handleEditChange}
                margin="dense"
                size="small"
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </TextField>
            ) : (
              <Chip
                label={ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                color={priorityColors[ticket.priority] || 'default'}
              />
            )}
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" color="textSecondary">
              Category
            </Typography>
            {editMode ? (
              <TextField
                select
                fullWidth
                name="category"
                value={editData.category}
                onChange={handleEditChange}
                margin="dense"
                size="small"
              >
                <MenuItem value="hardware">Hardware</MenuItem>
                <MenuItem value="software">Software</MenuItem>
                <MenuItem value="network">Network</MenuItem>
                <MenuItem value="security">Security</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            ) : (
              <Typography>
                {ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" color="textSecondary">
              Created By
            </Typography>
            <Typography>{ticket.user.name}</Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" color="textSecondary">
              Created At
            </Typography>
            <Typography>{formatDate(ticket.createdAt)}</Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" color="textSecondary">
              Updated At
            </Typography>
            <Typography>{formatDate(ticket.updatedAt)}</Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" color="textSecondary">
              Assigned To
            </Typography>
            {editMode && isStaffOrAdmin ? (
              <TextField
                fullWidth
                name="assignedTo"
                value={editData.assignedTo}
                onChange={handleEditChange}
                margin="dense"
                size="small"
                placeholder="User ID of assignee"
              />
            ) : (
              <Typography>
                {ticket.assignedTo ? ticket.assignedTo.name : 'Not assigned'}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {ticket.description}
            </Typography>
          </Grid>

          {ticket.attachments && ticket.attachments.length > 0 && (
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Attachments
              </Typography>
              <List>
                {ticket.attachments.map((attachment) => (
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
            </Grid>
          )}

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Comments
            </Typography>

            {ticket.comments && ticket.comments.length > 0 ? (
              <List>
                {ticket.comments.map((comment) => (
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
                No comments yet.
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

export default TicketDetail;
