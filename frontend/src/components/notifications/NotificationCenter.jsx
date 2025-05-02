import { useState, useEffect } from 'react';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Delete as DeleteIcon,
  DoneAll as DoneAllIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const NotificationCenter = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const open = Boolean(anchorEl);
  
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications?limit=10');
      
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread/count');
      
      if (res.data.success) {
        setUnreadCount(res.data.data.count);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };
  
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      
      // Set up polling for unread count
      const interval = setInterval(fetchUnreadCount, 60000); // Every minute
      
      return () => clearInterval(interval);
    }
  }, [user]);
  
  const handleClick = async (event) => {
    setAnchorEl(event.currentTarget);
    await fetchNotifications();
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      
      // Update the notification in the list
      setNotifications(
        notifications.map((notification) =>
          notification._id === id
            ? { ...notification, read: true }
            : notification
        )
      );
      
      // Update unread count
      fetchUnreadCount();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };
  
  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      
      // Update all notifications in the list
      setNotifications(
        notifications.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
      
      // Update unread count
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };
  
  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      
      // Remove the notification from the list
      setNotifications(
        notifications.filter((notification) => notification._id !== id)
      );
      
      // Update unread count
      fetchUnreadCount();
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };
  
  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.read) {
      handleMarkAsRead(notification._id);
    }
    
    // Navigate based on notification type
    if (notification.type === 'ticket' && notification.relatedItem) {
      navigate(`/dashboard/tickets/${notification.relatedItem}`);
    } else if (notification.type === 'change' && notification.relatedItem) {
      navigate(`/dashboard/changes/${notification.relatedItem}`);
    } else if (notification.type === 'knowledge' && notification.relatedItem) {
      navigate(`/dashboard/knowledge/${notification.relatedItem}`);
    } else if (notification.type === 'solution' && notification.relatedItem) {
      navigate(`/dashboard/solutions/${notification.relatedItem}`);
    }
    
    handleClose();
  };
  
  const getNotificationIcon = (type, priority) => {
    switch (type) {
      case 'ticket':
        return priority === 'high' ? (
          <Avatar sx={{ bgcolor: 'warning.main' }}>
            <WarningIcon />
          </Avatar>
        ) : (
          <Avatar sx={{ bgcolor: 'info.main' }}>
            <InfoIcon />
          </Avatar>
        );
      case 'change':
        return (
          <Avatar sx={{ bgcolor: 'secondary.main' }}>
            <InfoIcon />
          </Avatar>
        );
      case 'knowledge':
      case 'solution':
        return (
          <Avatar sx={{ bgcolor: 'success.main' }}>
            <CheckCircleIcon />
          </Avatar>
        );
      case 'system':
      default:
        return priority === 'high' ? (
          <Avatar sx={{ bgcolor: 'error.main' }}>
            <ErrorIcon />
          </Avatar>
        ) : (
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <EmailIcon />
          </Avatar>
        );
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-controls={open ? 'notification-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      <Menu
        id="notification-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 500,
            overflow: 'auto',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<DoneAllIcon />}
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </Box>
        
        <Divider />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="textSecondary">No notifications</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification) => (
              <ListItem
                key={notification._id}
                alignItems="flex-start"
                sx={{
                  bgcolor: notification.read ? 'transparent' : 'action.hover',
                  '&:hover': {
                    bgcolor: 'action.selected',
                    cursor: 'pointer',
                  },
                }}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notification._id);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
                onClick={() => handleNotificationClick(notification)}
              >
                <ListItemAvatar>
                  {getNotificationIcon(notification.type, notification.priority)}
                </ListItemAvatar>
                <ListItemText
                  primary={notification.title}
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="textPrimary"
                        sx={{ display: 'block' }}
                      >
                        {notification.message}
                      </Typography>
                      <Typography
                        component="span"
                        variant="caption"
                        color="textSecondary"
                      >
                        {formatDate(notification.createdAt)}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Menu>
    </>
  );
};

export default NotificationCenter;
