import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { employeeService } from '../../services/api';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [openQRDialog, setOpenQRDialog] = useState(false);
  const [qrCode, setQrCode] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePasswordChange = () => {
    if (formData.newPassword && !formData.currentPassword) {
      setError('Current password is required to set a new password');
      return false;
    }
    if (formData.newPassword && formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validatePasswordChange()) {
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        username: formData.username,
        email: formData.email
      };

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      await updateProfile(updateData);
      setSuccess('Profile updated successfully');
      
      // Reset password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleShowQR = async () => {
    try {
      const response = await employeeService.getEmployeeQRCode(user.id);
      setQrCode(response.data.qrCode);
      setOpenQRDialog(true);
    } catch (err) {
      setError('Failed to fetch QR code');
    }
  };

  const handleRegenerateQR = async () => {
    try {
      const response = await employeeService.regenerateQRCode(user.id);
      setQrCode(response.data.qrCode);
      setSuccess('QR code regenerated successfully');
    } catch (err) {
      setError('Failed to regenerate QR code');
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Profile Settings
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
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

            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Change Password
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    name="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="New Password"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{ mt: 2 }}
                  >
                    Save Changes
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                QR Code
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Use this QR code to register your meals
              </Typography>
              <Button
                variant="outlined"
                onClick={handleShowQR}
                fullWidth
                sx={{ mb: 1 }}
              >
                Show QR Code
              </Button>
              <Button
                variant="outlined"
                onClick={handleRegenerateQR}
                fullWidth
                color="secondary"
              >
                Regenerate QR Code
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openQRDialog} onClose={() => setOpenQRDialog(false)}>
        <DialogTitle>Your QR Code</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {qrCode && (
              <img
                src={qrCode}
                alt="QR Code"
                style={{ width: '200px', height: '200px', marginBottom: '16px' }}
              />
            )}
            <Typography variant="body2" color="textSecondary" align="center">
              Show this QR code to register your meals
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenQRDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
