import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { Send as SendIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const ChangeCreate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    impact: 'medium',
    category: 'other',
    plannedStartDate: dayjs().add(1, 'day'),
    plannedEndDate: dayjs().add(2, 'day'),
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDateChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.plannedEndDate.isBefore(formData.plannedStartDate)) {
      setError('End date cannot be before start date');
      return;
    }
    
    try {
      setLoading(true);
      
      const changeData = {
        ...formData,
        plannedStartDate: formData.plannedStartDate.toISOString(),
        plannedEndDate: formData.plannedEndDate.toISOString(),
      };
      
      const res = await api.post('/changes', changeData);
      
      if (res.data.success) {
        navigate(`/dashboard/changes/${res.data.data._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create change');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Create Change Request
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          Submit a new change request
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
                  placeholder="Brief summary of the change"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  required
                  fullWidth
                  label="Impact"
                  name="impact"
                  value={formData.impact}
                  onChange={handleChange}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </TextField>
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
                <DateTimePicker
                  label="Planned Start Date"
                  value={formData.plannedStartDate}
                  onChange={(newValue) => handleDateChange('plannedStartDate', newValue)}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DateTimePicker
                  label="Planned End Date"
                  value={formData.plannedEndDate}
                  onChange={(newValue) => handleDateChange('plannedEndDate', newValue)}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  multiline
                  rows={6}
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Please provide detailed information about the change, including purpose, scope, and impact"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="button"
                    variant="outlined"
                    sx={{ mr: 2 }}
                    onClick={() => navigate('/dashboard/changes')}
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
                    Submit Change
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default ChangeCreate;
