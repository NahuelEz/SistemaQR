import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid
} from '@mui/material';
import { QrReader } from 'react-qr-reader';
import { registerMeal } from '../../services/mealService';

const QRScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [mealType, setMealType] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [scannedData, setScannedData] = useState(null);

  const handleResult = async (result) => {
    if (result) {
      setScannedData(result?.text);
      setShowConfirmation(true);
      setScanning(false);
    }
  };

  const handleError = (error) => {
    console.error(error);
    setError('Error accessing camera');
    setScanning(false);
  };

  const handleMealTypeChange = (event) => {
    setMealType(event.target.value);
  };

  const handleStartScan = () => {
    if (!mealType) {
      setError('Please select a meal type first');
      return;
    }
    setError(null);
    setResult(null);
    setScanning(true);
  };

  const handleConfirm = async () => {
    try {
      const response = await registerMeal({
        qrData: scannedData,
        mealType: mealType
      });
      setResult(response);
      setError(null);
      setShowConfirmation(false);
      setScannedData(null);
    } catch (error) {
      setError(error.message);
      setResult(null);
      setShowConfirmation(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        QR Scanner
      </Typography>

      <Paper sx={{ p: 2, maxWidth: 600, mx: 'auto' }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Meal Type</InputLabel>
              <Select
                value={mealType}
                onChange={handleMealTypeChange}
                label="Meal Type"
              >
                <MenuItem value="breakfast">Breakfast</MenuItem>
                <MenuItem value="lunch">Lunch</MenuItem>
                <MenuItem value="snack">Snack</MenuItem>
                <MenuItem value="dinner">Dinner</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            {!scanning ? (
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleStartScan}
                disabled={!mealType}
              >
                Start Scanning
              </Button>
            ) : (
              <Box sx={{ position: 'relative' }}>
                <QrReader
                  constraints={{ facingMode: 'environment' }}
                  onResult={handleResult}
                  style={{ width: '100%' }}
                />
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => setScanning(false)}
                  sx={{ mt: 1 }}
                >
                  Cancel Scanning
                </Button>
              </Box>
            )}
          </Grid>

          {error && (
            <Grid item xs={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}

          {result && (
            <Grid item xs={12}>
              <Alert severity="success">
                Meal registered successfully!
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Employee: {result.employeeName}
                  <br />
                  Menu: {result.menuDetails}
                </Typography>
              </Alert>
            </Grid>
          )}
        </Grid>
      </Paper>

      <Dialog open={showConfirmation} onClose={() => setShowConfirmation(false)}>
        <DialogTitle>Confirm Meal Registration</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to register this {mealType} for the scanned employee?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmation(false)}>Cancel</Button>
          <Button onClick={handleConfirm} variant="contained" color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QRScanner;
