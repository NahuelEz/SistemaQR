import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
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
  CardContent
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, changePassword, getUserProfile } from '../../services/authService';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadProfile = useCallback(async () => {
    try {
      const data = await getUserProfile(user.id);
      setProfileData({
        username: data.username,
        email: data.email
      });
    } catch (error) {
      setError('Error loading profile');
    }
  }, [user.id]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async () => {
    try {
      const updatedUser = await updateProfile(user.id, profileData);
      updateUser(updatedUser);
      setSuccess('Profile updated successfully');
      setError('');
    } catch (error) {
      setError(error.message);
      setSuccess('');
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      await changePassword(user.id, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setSuccess('Password changed successfully');
      setError('');
      setOpenPasswordDialog(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setError(error.message);
      setSuccess('');
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Profile Settings
      </Typography>

      {(error || success) && (
        <Alert
          severity={error ? "error" : "success"}
          sx={{ mb: 2 }}
          onClose={() => {
            setError('');
            setSuccess('');
          }}
        >
          {error || success}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Box component="form" sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={profileData.username}
                  onChange={handleProfileChange}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  margin="normal"
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpdateProfile}
                  sx={{ mt: 2 }}
                >
                  Update Profile
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Security
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setOpenPasswordDialog(true)}
                sx={{ mt: 2 }}
              >
                Change Password
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Current Password"
            name="currentPassword"
            type="password"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="New Password"
            name="newPassword"
            type="password"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)}>Cancel</Button>
          <Button onClick={handleChangePassword} variant="contained" color="primary">
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
