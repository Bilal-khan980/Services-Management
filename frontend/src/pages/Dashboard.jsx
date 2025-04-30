import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Paper,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  ConfirmationNumber as TicketIcon,
  SwapHoriz as ChangeIcon,
  Book as KnowledgeIcon,
  Engineering as SolutionIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    tickets: {
      total: 0,
      new: 0,
      inProgress: 0,
      resolved: 0,
    },
    changes: {
      total: 0,
      pending: 0,
      approved: 0,
      implemented: 0,
    },
    knowledge: {
      total: 0,
    },
    solutions: {
      total: 0,
    },
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/dashboard/stats');

        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Welcome back, {user?.name}!
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Tickets Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <TicketIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h5">Tickets</Typography>
              </Box>
              <Typography variant="h3" component="div">
                {stats.tickets.total}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  New: {stats.tickets.new}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  In Progress: {stats.tickets.inProgress}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Resolved: {stats.tickets.resolved}
                </Typography>
              </Box>
              <Button
                component={RouterLink}
                to="/dashboard/tickets"
                variant="outlined"
                size="small"
                sx={{ mt: 2 }}
                fullWidth
              >
                View All
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Changes Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <ChangeIcon color="secondary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h5">Changes</Typography>
              </Box>
              <Typography variant="h3" component="div">
                {stats.changes.total}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Pending: {stats.changes.pending}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Approved: {stats.changes.approved}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Implemented: {stats.changes.implemented}
                </Typography>
              </Box>
              <Button
                component={RouterLink}
                to="/dashboard/changes"
                variant="outlined"
                size="small"
                sx={{ mt: 2 }}
                fullWidth
              >
                View All
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Knowledge Base Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <KnowledgeIcon color="info" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h5">Knowledge</Typography>
              </Box>
              <Typography variant="h3" component="div">
                {stats.knowledge.total}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Total articles in knowledge base
                </Typography>
              </Box>
              <Button
                component={RouterLink}
                to="/dashboard/knowledge"
                variant="outlined"
                size="small"
                sx={{ mt: 2 }}
                fullWidth
              >
                View All
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Solutions Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <SolutionIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h5">Solutions</Typography>
              </Box>
              <Typography variant="h3" component="div">
                {stats.solutions.total}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Internal solutions for staff
                </Typography>
              </Box>
              <Button
                component={RouterLink}
                to="/dashboard/solutions"
                variant="outlined"
                size="small"
                sx={{ mt: 2 }}
                fullWidth
                disabled={user?.role === 'user'}
              >
                View All
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button
                  component={RouterLink}
                  to="/dashboard/tickets/create"
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={<TicketIcon />}
                >
                  Create Ticket
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  component={RouterLink}
                  to="/dashboard/changes/create"
                  variant="contained"
                  color="secondary"
                  fullWidth
                  startIcon={<ChangeIcon />}
                >
                  Submit Change
                </Button>
              </Grid>
              {(user?.role === 'staff' || user?.role === 'admin') && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Button
                      component={RouterLink}
                      to="/dashboard/knowledge/create"
                      variant="contained"
                      color="info"
                      fullWidth
                      startIcon={<KnowledgeIcon />}
                    >
                      Create Article
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button
                      component={RouterLink}
                      to="/dashboard/solutions/create"
                      variant="contained"
                      color="success"
                      fullWidth
                      startIcon={<SolutionIcon />}
                    >
                      Create Solution
                    </Button>
                  </Grid>
                </>
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              No recent activity to display.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      )}
    </Box>
  );
};

export default Dashboard;
