import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardMedia,
  CardContent,
} from '@mui/material';
import {
  Save as SaveIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const Settings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updating, setUpdating] = useState(false);
  
  const [formData, setFormData] = useState({
    siteName: '',
    companyName: '',
    contactEmail: '',
    contactPhone: '',
    contactAddress: '',
    primaryColor: '',
    secondaryColor: '',
  });
  
  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings');
      
      if (res.data.success) {
        setSettings(res.data.data);
        setFormData({
          siteName: res.data.data.siteName || '',
          companyName: res.data.data.companyName || '',
          contactEmail: res.data.data.contactEmail || '',
          contactPhone: res.data.data.contactPhone || '',
          contactAddress: res.data.data.contactAddress || '',
          primaryColor: res.data.data.primaryColor || '#1976d2',
          secondaryColor: res.data.data.secondaryColor || '#dc004e',
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch settings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchSettings();
  }, []);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setSuccess('');
  };
  
  const handleLogoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };
  
  const handleFaviconChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFaviconFile(e.target.files[0]);
    }
  };
  
  const handleBannerChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setBannerFile(e.target.files[0]);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setUpdating(true);
      setError('');
      
      const res = await api.put('/settings', formData);
      
      if (res.data.success) {
        setSettings(res.data.data);
        setSuccess('Settings updated successfully');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update settings');
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };
  
  const handleLogoUpload = async () => {
    if (!logoFile) return;
    
    try {
      setUploadingLogo(true);
      setError('');
      
      const formData = new FormData();
      formData.append('file', logoFile);
      
      const res = await api.put('/settings/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (res.data.success) {
        setSettings(res.data.data);
        setSuccess('Logo uploaded successfully');
        setLogoFile(null);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload logo');
      console.error(err);
    } finally {
      setUploadingLogo(false);
    }
  };
  
  const handleFaviconUpload = async () => {
    if (!faviconFile) return;
    
    try {
      setUploadingFavicon(true);
      setError('');
      
      const formData = new FormData();
      formData.append('file', faviconFile);
      
      const res = await api.put('/settings/favicon', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (res.data.success) {
        setSettings(res.data.data);
        setSuccess('Favicon uploaded successfully');
        setFaviconFile(null);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload favicon');
      console.error(err);
    } finally {
      setUploadingFavicon(false);
    }
  };
  
  const handleBannerUpload = async () => {
    if (!bannerFile) return;
    
    try {
      setUploadingBanner(true);
      setError('');
      
      const formData = new FormData();
      formData.append('file', bannerFile);
      
      const res = await api.put('/settings/banner', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (res.data.success) {
        setSettings(res.data.data);
        setSuccess('Banner uploaded successfully');
        setBannerFile(null);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload banner');
      console.error(err);
    } finally {
      setUploadingBanner(false);
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        System Settings
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Customize your ITSM solution
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
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              General Settings
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Site Name"
                    name="siteName"
                    value={formData.siteName}
                    onChange={handleChange}
                    helperText="The name of your ITSM solution"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    helperText="Your organization name"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Contact Email"
                    name="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    helperText="Primary contact email"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Contact Phone"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    helperText="Primary contact phone number"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Contact Address"
                    name="contactAddress"
                    multiline
                    rows={2}
                    value={formData.contactAddress}
                    onChange={handleChange}
                    helperText="Organization address"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Primary Color"
                    name="primaryColor"
                    type="color"
                    value={formData.primaryColor}
                    onChange={handleChange}
                    InputProps={{
                      sx: { height: 56 }
                    }}
                    helperText="Main theme color"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Secondary Color"
                    name="secondaryColor"
                    type="color"
                    value={formData.secondaryColor}
                    onChange={handleChange}
                    InputProps={{
                      sx: { height: 56 }
                    }}
                    helperText="Accent color"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={updating ? <CircularProgress size={20} /> : <SaveIcon />}
                      disabled={updating}
                    >
                      Save Settings
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Branding
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Logo
                    </Typography>
                    {settings?.logo && (
                      <CardMedia
                        component="img"
                        image={settings.logo}
                        alt="Logo"
                        sx={{ height: 100, width: 'auto', mb: 2, objectFit: 'contain' }}
                      />
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Button
                        variant="contained"
                        component="label"
                        sx={{ mr: 2 }}
                      >
                        Choose File
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleLogoChange}
                        />
                      </Button>
                      <Typography variant="body2" color="textSecondary">
                        {logoFile ? logoFile.name : 'No file chosen'}
                      </Typography>
                    </Box>
                    {logoFile && (
                      <Button
                        variant="outlined"
                        startIcon={uploadingLogo ? <CircularProgress size={20} /> : <UploadIcon />}
                        onClick={handleLogoUpload}
                        disabled={uploadingLogo}
                        sx={{ mt: 2 }}
                      >
                        Upload Logo
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Favicon
                    </Typography>
                    {settings?.favicon && (
                      <CardMedia
                        component="img"
                        image={settings.favicon}
                        alt="Favicon"
                        sx={{ height: 32, width: 32, mb: 2, objectFit: 'contain' }}
                      />
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Button
                        variant="contained"
                        component="label"
                        sx={{ mr: 2 }}
                      >
                        Choose File
                        <input
                          type="file"
                          hidden
                          accept="image/x-icon,image/png"
                          onChange={handleFaviconChange}
                        />
                      </Button>
                      <Typography variant="body2" color="textSecondary">
                        {faviconFile ? faviconFile.name : 'No file chosen'}
                      </Typography>
                    </Box>
                    {faviconFile && (
                      <Button
                        variant="outlined"
                        startIcon={uploadingFavicon ? <CircularProgress size={20} /> : <UploadIcon />}
                        onClick={handleFaviconUpload}
                        disabled={uploadingFavicon}
                        sx={{ mt: 2 }}
                      >
                        Upload Favicon
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Banner Image
                    </Typography>
                    {settings?.banner && (
                      <CardMedia
                        component="img"
                        image={settings.banner}
                        alt="Banner"
                        sx={{ height: 150, mb: 2, objectFit: 'cover' }}
                      />
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Button
                        variant="contained"
                        component="label"
                        sx={{ mr: 2 }}
                      >
                        Choose File
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleBannerChange}
                        />
                      </Button>
                      <Typography variant="body2" color="textSecondary">
                        {bannerFile ? bannerFile.name : 'No file chosen'}
                      </Typography>
                    </Box>
                    {bannerFile && (
                      <Button
                        variant="outlined"
                        startIcon={uploadingBanner ? <CircularProgress size={20} /> : <UploadIcon />}
                        onClick={handleBannerUpload}
                        disabled={uploadingBanner}
                        sx={{ mt: 2 }}
                      >
                        Upload Banner
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;
