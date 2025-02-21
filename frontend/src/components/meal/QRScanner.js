import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import { QrReader } from 'react-qr-reader';
import { mealService } from '../../services/api';
import moment from 'moment';

const QRScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [menuData, setMenuData] = useState(null);

  useEffect(() => {
    if (scannedData) {
      verifyQRCode(scannedData);
    }
  }, [scannedData]);

  const verifyQRCode = async (qrCode) => {
    setLoading(true);
    setError('');
    try {
      const today = moment().format('YYYY-MM-DD');
      const response = await mealService.getDailyMenu(today);
      const availableMenus = response.data;
      
      if (availableMenus.length === 0) {
        throw new Error('No menus available for today');
      }
      
      setMenuData(availableMenus);
      setScanning(false);
    } catch (err) {
      setError(err.message || 'Failed to verify QR code');
      setScannedData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = (data) => {
    if (data) {
      setScannedData(data?.text || data);
    }
  };

  const handleError = (err) => {
    console.error(err);
    setError('Error accessing camera');
  };

  const handleMealRegistration = async () => {
    if (!selectedMeal || !scannedData) {
      setError('Please select a meal type');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const selectedMenu = menuData.find(menu => menu.meal_type === selectedMeal);
      if (!selectedMenu) {
        throw new Error('Selected meal type not available');
      }

      await mealService.scanAndRegister({
        qrCode: scannedData,
        menuId: selectedMenu.id,
        mealType: selectedMeal
      });

      setSuccess('Meal registered successfully');
      setTimeout(() => {
        handleReset();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register meal');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setScannedData(null);
    setSelectedMeal('');
    setError('');
    setSuccess('');
    setMenuData(null);
    setScanning(false);
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom align="center">
          QR Code Scanner
        </Typography>

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

        {!scanning && !scannedData && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Button
              variant="contained"
              onClick={() => setScanning(true)}
              disabled={loading}
            >
              Start Scanning
            </Button>
          </Box>
        )}

        {scanning && (
          <Box sx={{ mb: 2 }}>
            <QrReader
              constraints={{ facingMode: 'environment' }}
              onResult={handleScan}
              onError={handleError}
              style={{ width: '100%' }}
            />
          </Box>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress />
          </Box>
        )}

        {scannedData && menuData && (
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select Meal</InputLabel>
              <Select
                value={selectedMeal}
                label="Select Meal"
                onChange={(e) => setSelectedMeal(e.target.value)}
              >
                {menuData.map((menu) => (
                  <MenuItem key={menu.id} value={menu.meal_type}>
                    {menu.meal_type.charAt(0).toUpperCase() + menu.meal_type.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                onClick={handleMealRegistration}
                disabled={!selectedMeal || loading}
              >
                Register Meal
              </Button>
              <Button
                variant="outlined"
                onClick={handleReset}
                disabled={loading}
              >
                Reset
              </Button>
            </Box>
          </Box>
        )}
      </Paper>

      <Dialog open={!!menuData && !!selectedMeal} onClose={() => setSelectedMeal('')}>
        <DialogTitle>Confirm Meal Selection</DialogTitle>
        <DialogContent>
          {selectedMeal && menuData && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Selected Meal: {selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)}
              </Typography>
              {menuData.find(menu => menu.meal_type === selectedMeal)?.main_dish && (
                <Typography>
                  Main Dish: {menuData.find(menu => menu.meal_type === selectedMeal).main_dish}
                </Typography>
              )}
              {menuData.find(menu => menu.meal_type === selectedMeal)?.alternative_dish && (
                <Typography>
                  Alternative: {menuData.find(menu => menu.meal_type === selectedMeal).alternative_dish}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedMeal('')}>Cancel</Button>
          <Button onClick={handleMealRegistration} variant="contained" color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QRScanner;
