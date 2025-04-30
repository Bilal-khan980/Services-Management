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
  Card,
  CardContent,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
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

const ChangeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [change, setChange] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [addingComment, setAddingComment] = useState(false);
  const [reviewStatus, setReviewStatus] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    status: '',
    impact: '',
    category: '',
    plannedStartDate: null,
    plannedEndDate: null,
    assignedTo: '',
  });

  const fetchChange = async () => {
    try {
      setLoading(true);
      setError(''); // Clear any previous errors

      // Check if id is valid
      if (!id) {
        setError('Invalid change ID');
        setLoading(false);
        return;
      }

      // Validate MongoDB ObjectId format (24 hex characters)
      if (!/^[0-9a-fA-F]{24}$/.test(id)) {
        setError(`Invalid change ID format: ${id}`);
        setLoading(false);
        return;
      }

      const res = await api.get(`/changes/${id}`);

      if (res.data.success) {
        setChange(res.data.data);
        setEditData({
          status: res.data.data.status,
          impact: res.data.data.impact,
          category: res.data.data.category,
          plannedStartDate: dayjs(res.data.data.plannedStartDate),
          plannedEndDate: dayjs(res.data.data.plannedEndDate),
          assignedTo: res.data.data.assignedTo?._id || '',
        });
      }
    } catch (err) {
      console.error('Error fetching change:', err);

      // Handle specific error cases
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (err.response.status === 404) {
          setError('Change not found');
        } else if (err.response.status === 400) {
          setError(err.response.data?.error || 'Invalid request');
        } else if (err.response.status === 401 || err.response.status === 403) {
          setError('You are not authorized to view this change');
          // Auth context will handle the redirect
        } else {
          setError(err.response.data?.error || `Server error: ${err.response.status}`);
        }
      } else if (err.request) {
        // The request was made but no response was received
        setError('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError('Failed to fetch change: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChange();
  }, [id]);

  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDateChange = (field, value) => {
    setEditData({
      ...editData,
      [field]: value,
    });
  };

  const handleUpdateChange = async () => {
    try {
      setUpdating(true);

      // Validate ID before making the request
      if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
        setError(`Invalid change ID format: ${id}`);
        setUpdating(false);
        return;
      }

      const updateData = {
        ...editData,
        plannedStartDate: editData.plannedStartDate.toISOString(),
        plannedEndDate: editData.plannedEndDate.toISOString(),
      };

      const res = await api.put(`/changes/${id}`, updateData);

      if (res.data.success) {
        setChange(res.data.data);
        setEditMode(false);
      }
    } catch (err) {
      console.error('Error updating change:', err);

      // Handle specific error cases
      if (err.response) {
        if (err.response.status === 400) {
          setError(err.response.data?.error || 'Invalid request');
        } else if (err.response.status === 404) {
          setError('Change not found');
        } else {
          setError(err.response?.data?.error || 'Failed to update change');
        }
      } else {
        setError('Failed to update change. Please check your connection.');
      }
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

      // Validate ID before making the request
      if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
        setError(`Invalid change ID format: ${id}`);
        setAddingComment(false);
        return;
      }

      // In a real app, you would have an API endpoint for adding comments
      // For now, we'll simulate it by updating the change with a new comment
      const updatedComments = [
        ...(change.comments || []),
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

      const res = await api.put(`/changes/${id}`, {
        comments: updatedComments,
      });

      if (res.data.success) {
        setChange(res.data.data);
        setCommentText('');
      }
    } catch (err) {
      console.error('Error adding comment:', err);

      if (err.response) {
        if (err.response.status === 400) {
          setError(err.response.data?.error || 'Invalid request');
        } else if (err.response.status === 404) {
          setError('Change not found');
        } else {
          setError(err.response?.data?.error || 'Failed to add comment');
        }
      } else {
        setError('Failed to add comment. Please check your connection.');
      }
    } finally {
      setAddingComment(false);
    }
  };

  const handleReviewStatusChange = (e) => {
    setReviewStatus(e.target.value);
  };

  const handleReviewCommentChange = (e) => {
    setReviewComment(e.target.value);
  };

  const handleSubmitReview = async () => {
    try {
      setSubmittingReview(true);

      // Validate ID before making the request
      if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
        setError(`Invalid change ID format: ${id}`);
        setSubmittingReview(false);
        return;
      }

      // In a real app, you would have an API endpoint for submitting reviews
      // For now, we'll simulate it by updating the change with a new review
      const updatedReviewers = [
        ...(change.reviewers || []),
        {
          _id: Date.now().toString(), // Temporary ID
          user: {
            _id: user._id,
            name: user.name,
          },
          status: reviewStatus,
          comments: reviewComment,
          reviewedAt: new Date().toISOString(),
        },
      ];

      const res = await api.put(`/changes/${id}`, {
        reviewers: updatedReviewers,
      });

      if (res.data.success) {
        setChange(res.data.data);
        setReviewStatus('');
        setReviewComment('');
      }
    } catch (err) {
      console.error('Error submitting review:', err);

      if (err.response) {
        if (err.response.status === 400) {
          setError(err.response.data?.error || 'Invalid request');
        } else if (err.response.status === 404) {
          setError('Change not found');
        } else {
          setError(err.response?.data?.error || 'Failed to submit review');
        }
      } else {
        setError('Failed to submit review. Please check your connection.');
      }
    } finally {
      setSubmittingReview(false);
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
          onClick={() => navigate('/dashboard/changes')}
          sx={{ mb: 3 }}
        >
          Back to Changes
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!change) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard/changes')}
          sx={{ mb: 3 }}
        >
          Back to Changes
        </Button>
        <Alert severity="info">Change not found</Alert>
      </Box>
    );
  }

  const isStaffOrAdmin = user.role === 'staff' || user.role === 'admin';
  const isChangeOwner = change.user._id.toString() === user._id;
  const canEdit = isStaffOrAdmin || isChangeOwner;
  const canReview = isStaffOrAdmin && !isChangeOwner;

  // Check if user has already reviewed
  const hasReviewed = change.reviewers?.some(reviewer => reviewer.user._id.toString() === user._id);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard/changes')}
          sx={{ mb: 3 }}
        >
          Back to Changes
        </Button>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5">
                  Change #{change._id.slice(-6).toUpperCase()}: {change.title}
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
                      onClick={handleUpdateChange}
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
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="submitted">Submitted</MenuItem>
                  <MenuItem value="under-review">Under Review</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="implemented">Implemented</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </TextField>
              ) : (
                <Chip
                  label={change.status.charAt(0).toUpperCase() + change.status.slice(1).replace('-', ' ')}
                  color={statusColors[change.status] || 'default'}
                />
              )}
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="textSecondary">
                Impact
              </Typography>
              {editMode ? (
                <TextField
                  select
                  fullWidth
                  name="impact"
                  value={editData.impact}
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
                  label={change.impact.charAt(0).toUpperCase() + change.impact.slice(1)}
                  color={impactColors[change.impact] || 'default'}
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
                  <MenuItem value="process">Process</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
              ) : (
                <Typography>
                  {change.category.charAt(0).toUpperCase() + change.category.slice(1)}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="textSecondary">
                Created By
              </Typography>
              <Typography>{change.user.name}</Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="textSecondary">
                Created At
              </Typography>
              <Typography>{formatDate(change.createdAt)}</Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="textSecondary">
                Updated At
              </Typography>
              <Typography>{formatDate(change.updatedAt)}</Typography>
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
                  {change.assignedTo ? change.assignedTo.name : 'Not assigned'}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Planned Start Date
              </Typography>
              {editMode ? (
                <DateTimePicker
                  value={editData.plannedStartDate}
                  onChange={(newValue) => handleDateChange('plannedStartDate', newValue)}
                  slotProps={{ textField: { fullWidth: true, size: 'small', margin: 'dense' } }}
                />
              ) : (
                <Typography>{formatDate(change.plannedStartDate)}</Typography>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Planned End Date
              </Typography>
              {editMode ? (
                <DateTimePicker
                  value={editData.plannedEndDate}
                  onChange={(newValue) => handleDateChange('plannedEndDate', newValue)}
                  slotProps={{ textField: { fullWidth: true, size: 'small', margin: 'dense' } }}
                />
              ) : (
                <Typography>{formatDate(change.plannedEndDate)}</Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {change.description}
              </Typography>
            </Grid>

            {change.attachments && change.attachments.length > 0 && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Attachments
                </Typography>
                <List>
                  {change.attachments.map((attachment) => (
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

            {/* Reviews Section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Reviews
              </Typography>

              {change.reviewers && change.reviewers.length > 0 ? (
                <Grid container spacing={2}>
                  {change.reviewers.map((reviewer) => (
                    <Grid item xs={12} sm={6} md={4} key={reviewer._id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Avatar sx={{ mr: 1 }}>
                              {reviewer.user.name.charAt(0)}
                            </Avatar>
                            <Typography variant="subtitle1">
                              {reviewer.user.name}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Chip
                              size="small"
                              label={reviewer.status.charAt(0).toUpperCase() + reviewer.status.slice(1)}
                              color={
                                reviewer.status === 'approved'
                                  ? 'success'
                                  : reviewer.status === 'rejected'
                                  ? 'error'
                                  : 'default'
                              }
                              icon={
                                reviewer.status === 'approved' ? (
                                  <ThumbUpIcon fontSize="small" />
                                ) : reviewer.status === 'rejected' ? (
                                  <ThumbDownIcon fontSize="small" />
                                ) : null
                              }
                            />
                            <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                              {formatDate(reviewer.reviewedAt)}
                            </Typography>
                          </Box>
                          {reviewer.comments && (
                            <Typography variant="body2">{reviewer.comments}</Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No reviews yet.
                </Typography>
              )}

              {/* Add Review Form */}
              {canReview && !hasReviewed && change.status !== 'draft' && (
                <Box sx={{ mt: 3, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Submit Your Review
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        label="Review Status"
                        value={reviewStatus}
                        onChange={handleReviewStatusChange}
                        required
                      >
                        <MenuItem value="approved">Approve</MenuItem>
                        <MenuItem value="rejected">Reject</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Comments"
                        value={reviewComment}
                        onChange={handleReviewCommentChange}
                        placeholder="Add your review comments..."
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        color={reviewStatus === 'approved' ? 'success' : reviewStatus === 'rejected' ? 'error' : 'primary'}
                        startIcon={submittingReview ? <CircularProgress size={20} /> : null}
                        onClick={handleSubmitReview}
                        disabled={submittingReview || !reviewStatus}
                      >
                        Submit Review
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Grid>

            {/* Comments Section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Comments
              </Typography>

              {change.comments && change.comments.length > 0 ? (
                <List>
                  {change.comments.map((comment) => (
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
    </LocalizationProvider>
  );
};

export default ChangeDetail;
