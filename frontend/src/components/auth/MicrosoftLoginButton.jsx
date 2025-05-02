import { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { Microsoft as MicrosoftIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const MicrosoftLoginButton = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Microsoft authentication configuration
  const msalConfig = {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID}`,
    redirectUri: window.location.origin,
  };
  
  // Check if Microsoft authentication is enabled
  const isMicrosoftEnabled = !!import.meta.env.VITE_ENABLE_MICROSOFT_365;
  
  const handleMicrosoftLogin = async () => {
    if (!isMicrosoftEnabled) {
      console.error('Microsoft 365 integration is not enabled');
      return;
    }
    
    setLoading(true);
    
    try {
      // In a real implementation, you would use MSAL.js to handle the authentication flow
      // For this example, we'll simulate a successful authentication
      
      // Simulate getting a token from Microsoft
      const mockAccessToken = 'mock-microsoft-access-token';
      const mockEmail = 'user@example.com';
      
      // Call our backend to authenticate with Microsoft
      const response = await api.post('/auth/microsoft', {
        email: mockEmail,
        accessToken: mockAccessToken,
      });
      
      if (response.data.success) {
        // Store the token in localStorage
        localStorage.setItem('token', response.data.token);
        
        // Update auth context
        login(mockEmail, 'password', response.data.token);
      }
    } catch (error) {
      console.error('Microsoft login error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (!isMicrosoftEnabled) {
    return null;
  }
  
  return (
    <Button
      fullWidth
      variant="outlined"
      color="primary"
      startIcon={loading ? <CircularProgress size={20} /> : <MicrosoftIcon />}
      onClick={handleMicrosoftLogin}
      disabled={loading}
      sx={{ mt: 1, mb: 1 }}
    >
      {loading ? 'Signing in...' : 'Sign in with Microsoft'}
    </Button>
  );
};

export default MicrosoftLoginButton;
