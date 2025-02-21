import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  TextField
} from '@mui/material';
import { getWeeklyMenu, saveWeeklySelection } from '../../services/menuService';
import { format, startOfWeek } from 'date-fns';

const WeeklySelection = () => {
  const [weeklyMenu, setWeeklyMenu] = useState([]);
  const [selections, setSelections] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadWeeklyMenu();
  }, []);

  const loadWeeklyMenu = async () => {
    try {
      const startDate = format(startOfWeek(new Date()), 'yyyy-MM-dd');
      const data = await getWeeklyMenu(startDate);
      setWeeklyMenu(data);
      
      // Initialize selections
      const initialSelections = {};
      data.forEach(menu => {
        initialSelections[menu.id] = {
          selected_dish: 'main',
          special_requirements: ''
        };
      });
      setSelections(initialSelections);
    } catch (error) {
      setError('Error loading weekly menu');
      console.error(error);
    }
  };

  const handleSelectionChange = (menuId, field, value) => {
    setSelections(prev => ({
      ...prev,
      [menuId]: {
        ...prev[menuId],
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      await saveWeeklySelection(selections);
      setSuccess(true);
      setError(null);
    } catch (error) {
      setError('Error saving selections');
      setSuccess(false);
      console.error(error);
    }
  };

  const getDayName = (date) => {
    return format(new Date(date), 'EEEE');
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Weekly Menu Selection
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Selections saved successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        {weeklyMenu.map((menu) => (
          <Grid item xs={12} key={menu.id}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {getDayName(menu.date)} - {menu.meal_type}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Dish Selection</InputLabel>
                    <Select
                      value={selections[menu.id]?.selected_dish || 'main'}
                      onChange={(e) => handleSelectionChange(menu.id, 'selected_dish', e.target.value)}
                      label="Dish Selection"
                    >
                      <MenuItem value="main">{menu.main_dish}</MenuItem>
                      {menu.alternative_dish && (
                        <MenuItem value="alternative">{menu.alternative_dish}</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Special Requirements"
                    value={selections[menu.id]?.special_requirements || ''}
                    onChange={(e) => handleSelectionChange(menu.id, 'special_requirements', e.target.value)}
                    multiline
                    rows={2}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1">
                    Dessert: {menu.dessert}
                  </Typography>
                  {menu.special_diet_options && (
                    <Typography variant="subtitle2" color="textSecondary">
                      Special Diet Options Available
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          size="large"
        >
          Save Selections
        </Button>
      </Box>
    </Box>
  );
};

export default WeeklySelection;
