import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Alert,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { getMenus, createMenu, updateMenu, deleteMenu } from '../../services/menuService';
import { parseISO, format } from 'date-fns';

const Menus = () => {
  const [menus, setMenus] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    meal_type: '',
    main_dish: '',
    alternative_dish: '',
    dessert: '',
    special_diet_options: {}
  });

  useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = async () => {
    try {
      const data = await getMenus();
      setMenus(data);
    } catch (error) {
      setError('Error loading menus');
      console.error(error);
    }
  };

  const handleOpenDialog = (menu = null) => {
    if (menu) {
      setFormData({
        date: menu.date,
        meal_type: menu.meal_type,
        main_dish: menu.main_dish,
        alternative_dish: menu.alternative_dish || '',
        dessert: menu.dessert || '',
        special_diet_options: menu.special_diet_options || {}
      });
      setSelectedMenu(menu);
    } else {
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        meal_type: '',
        main_dish: '',
        alternative_dish: '',
        dessert: '',
        special_diet_options: {}
      });
      setSelectedMenu(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMenu(null);
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      if (selectedMenu) {
        await updateMenu(selectedMenu.id, formData);
        setSuccess('Menu updated successfully');
      } else {
        await createMenu(formData);
        setSuccess('Menu created successfully');
      }
      loadMenus();
      handleCloseDialog();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this menu?')) {
      try {
        await deleteMenu(id);
        setSuccess('Menu deleted successfully');
        loadMenus();
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">Menus</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpenDialog()}
          >
            Add Menu
          </Button>
        </Grid>

        {(error || success) && (
          <Grid item xs={12}>
            <Alert
              severity={error ? "error" : "success"}
              onClose={() => {
                setError(null);
                setSuccess(null);
              }}
            >
              {error || success}
            </Alert>
          </Grid>
        )}

        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Meal Type</TableCell>
                  <TableCell>Main Dish</TableCell>
                  <TableCell>Alternative</TableCell>
                  <TableCell>Dessert</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {menus.map((menu) => (
                  <TableRow key={menu.id}>
                    <TableCell>{formatDate(menu.date)}</TableCell>
                    <TableCell>{menu.meal_type}</TableCell>
                    <TableCell>{menu.main_dish}</TableCell>
                    <TableCell>{menu.alternative_dish}</TableCell>
                    <TableCell>{menu.dessert}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleOpenDialog(menu)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(menu.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{selectedMenu ? 'Edit Menu' : 'Add Menu'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                name="date"
                label="Date"
                value={formData.date}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Meal Type</InputLabel>
                <Select
                  name="meal_type"
                  value={formData.meal_type}
                  onChange={handleInputChange}
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
              <TextField
                fullWidth
                name="main_dish"
                label="Main Dish"
                value={formData.main_dish}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="alternative_dish"
                label="Alternative Dish"
                value={formData.alternative_dish}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="dessert"
                label="Dessert"
                value={formData.dessert}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedMenu ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Menus;
