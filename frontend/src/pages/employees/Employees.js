import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  QrCode as QrCodeIcon
} from '@mui/icons-material';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee, generateQRCode } from '../../services/employeeService';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openQRDialog, setOpenQRDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'employee'
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (error) {
      setError('Error loading employees');
    }
  };

  const handleOpenDialog = (employee = null) => {
    if (employee) {
      setFormData({
        username: employee.username,
        email: employee.email,
        role: employee.role,
        password: ''
      });
      setSelectedEmployee(employee);
    } else {
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'employee'
      });
      setSelectedEmployee(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEmployee(null);
    setError('');
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
      if (selectedEmployee) {
        await updateEmployee(selectedEmployee.id, formData);
        setSuccess('Employee updated successfully');
      } else {
        await createEmployee(formData);
        setSuccess('Employee created successfully');
      }
      loadEmployees();
      handleCloseDialog();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await deleteEmployee(id);
        setSuccess('Employee deleted successfully');
        loadEmployees();
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const handleGenerateQR = async (employee) => {
    try {
      const data = await generateQRCode(employee.id);
      setQrCode(data.qrCode);
      setOpenQRDialog(true);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Employees</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Add Employee
        </Button>
      </Box>

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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>{employee.username}</TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>{employee.role}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleGenerateQR(employee)}>
                    <QrCodeIcon />
                  </IconButton>
                  <IconButton onClick={() => handleOpenDialog(employee)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(employee.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {selectedEmployee ? 'Edit Employee' : 'Add Employee'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                label="Role"
              >
                <MenuItem value="employee">Employee</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedEmployee ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openQRDialog} onClose={() => setOpenQRDialog(false)}>
        <DialogTitle>Employee QR Code</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <img src={qrCode} alt="QR Code" style={{ maxWidth: '100%' }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenQRDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Employees;
