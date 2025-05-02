import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <Paper sx={{ p: 4, m: 2, maxWidth: '800px', mx: 'auto' }}>
          <Typography variant="h4" color="error" gutterBottom>
            Something went wrong
          </Typography>
          <Typography variant="body1" paragraph>
            We're sorry, but there was an error loading this page. This could be due to a temporary issue or a problem with the application.
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Error details: {this.state.error?.toString()}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button 
              variant="contained" 
              color="primary" 
              component={RouterLink} 
              to="/dashboard"
            >
              Go to Dashboard
            </Button>
            <Button 
              variant="outlined"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </Box>
        </Paper>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
