import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Tabs,
  Tab,
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { menuService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import moment from 'moment';

const MEAL_TYPES = ['breakfast', 'lunch', 'snack', 'dinner'];

const Menu = () => {
  const [weeklyMenu, setWeeklyMenu] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment().startOf('week'));
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const { isAdmin } = useAuth();

  const [formData, setFormData] = useState({
    date: moment().format('YYYY-MM-DD'),
    mealType: 'lunch',
    mainDish: '',
    alternativeDish: '',
    dessert: '',
    specialDietOptions: {}
  });

  useEffect(() => {
    fetchWeeklyMenu();
  }, [selectedDate]);

  const fetchWeeklyMenu = async () => {
    try {
      const startDate = selectedDate.format('YYYY-MM-DD');
      const endDate = selectedDate.clone().endOf('week').format('YYYY-MM-DD');
      const response = await menuService.getWeeklyMenu(startDate, endDate);
      setWeeklyMenu(response.data);
    } catch (err) {
      setError('Failed to fetch menu data');
    }
  };

  const handleOpenDialog = (menu = null) => {
    if (menu) {
      setSelectedMenu(menu);
      setFormData({
        date: menu.date,
        mealType: menu.meal_type,
        mainDish: menu.main_dish,
        alternativeDish: menu.alternative_dish || '',
        dessert: menu.dessert || '',
        specialDietOptions: menu.special_diet_options || {}
      });
    } else {
      setSelectedMenu(null);
      setFormData({
        date: moment().format('YYYY-MM-DD'),
        mealType: 'lunch',
        mainDish: '',
        alternativeDish: '',
        dessert: '',
        specialDietOptions: {}
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMenu(null);
    setError('');
  };

  const handleSubmit = async () => {
    try {
      if (selectedMenu) {
        await menuService.updateMenu(selectedMenu.id, formData);
      } else {
        await menuService.createMenu(formData);
      }
      handleCloseDialog();
      fetchWeeklyMenu();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save menu');
    }
  };

  const handleDelete = async (menuId) => {
    if (window.confirm('Are you sure you want to delete this menu?')) {
      try {
        await menuService.deleteMenu(menuId);
        fetchWeeklyMenu();
      } catch (err) {
        setError('Failed to delete menu');
      }
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSelectedDate(moment().add(newValue, 'weeks').startOf('week'));
  };

  const renderMenuCard = (menu) => (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h6" color="primary">
          {menu.meal_type.charAt(0).toUpperCase() + menu.meal_type.slice(1)}
        </Typography>
        {isAdmin && (
          <Box>
            <IconButton size="small" onClick={() => handleOpenDialog(menu)}>
              <EditIcon />
            </IconButton>
            <IconButton size="small" onClick={() => handleDelete(menu.id)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        )}
      </Box>
      <Typography variant="subtitle1" fontWeight="bold">Main Dish:</Typography>
      <Typography>{menu.main_dish}</Typography>
      {menu.alternative_dish && (
        <>
          <Typography variant="subtitle1" fontWeight="bold" mt={1}>Alternative:</Typography>
          <Typography>{menu.alternative_dish}</Typography>
        </>
      )}
      {menu.dessert && (
        <>
          <Typography variant="subtitle1" fontWeight="bold" mt={1}>Dessert:</Typography>
          <Typography>{menu.dessert}</Typography>
        </>
      )}
    </Paper>
  );

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="This Week" />
          <Tab label="Next Week" />
          <Tab label="In Two Weeks" />
        </Tabs>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isAdmin && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ mb: 3 }}
        >
          Add Menu Item
        </Button>
      )}

      <Grid container spacing={3}>
        {MEAL_TYPES.map((mealType) => {
          const mealsOfType = weeklyMenu.filter(menu => menu.meal_type === mealType);
          return (
            <Grid item xs={12} key={mealType}>
              <Typography variant="h6" gutterBottom>
                {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
              </Typography>
              <Grid container spacing={2}>
                {[0, 1, 2, 3, 4, 5, 6].map((dayOffset) => {
                  const date = selectedDate.clone().add(dayOffset, 'days');
                  const menu = mealsOfType.find(m => moment(m.date).isSame(date, 'day'));
                  return (
                    <Grid item xs={12} sm={6} md={3} key={date.format('YYYY-MM-DD')}>
                      <Typography variant="subtitle2" gutterBottom>
                        {date.format('dddd, MMM D')}
                      </Typography>
                      {menu ? renderMenuCard(menu) : (
                        <Paper
                          elevation={3}
                          sx={{
                            p: 2,
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Typography color="text.secondary">No menu set</Typography>
                        </Paper>
                      )}
                    </Grid>
                  );
                })}
              </Grid>
            </Grid>
          );
        })}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedMenu ? 'Edit Menu Item' : 'Add Menu Item'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Meal Type</InputLabel>
                <Select
                  value={formData.mealType}
                  label="Meal Type"
                  onChange={(e) => setFormData({ ...formData, mealType: e.target.value })}
                >
                  {MEAL_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Main Dish"
                value={formData.mainDish}
                onChange={(e) => setFormData({ ...formData, mainDish: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Alternative Dish"
                value={formData.alternativeDish}
                onChange={(e) => setFormData({ ...formData, alternativeDish: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dessert"
                value={formData.dessert}
                onChange={(e) => setFormData({ ...formData, dessert: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedMenu ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Menu;
