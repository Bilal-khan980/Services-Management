import { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  CircularProgress, 
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import api from '../../services/api';

const FileUpload = ({ articleId, onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setSuccess('');

      // Create form data
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Upload the file
      const res = await api.put(`/knowledge/${articleId}/attachment`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        setSuccess('File uploaded successfully');
        setSelectedFile(null);
        
        // Call the callback function to update the parent component
        if (onUploadSuccess) {
          onUploadSuccess(res.data.data);
        }
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(err.response?.data?.error || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Upload Document</Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Button
          variant="contained"
          component="label"
          startIcon={<CloudUploadIcon />}
          sx={{ mr: 2 }}
        >
          Select File
          <input
            type="file"
            hidden
            onChange={handleFileChange}
          />
        </Button>
        
        <Button
          variant="outlined"
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          startIcon={uploading ? <CircularProgress size={20} /> : <AttachFileIcon />}
        >
          Upload
        </Button>
      </Box>
      
      {selectedFile && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2">
            Selected file: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
          </Typography>
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
    </Box>
  );
};

export default FileUpload;
