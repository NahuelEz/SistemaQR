import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  QrCode as QrCodeIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { employeeService } from '../../services/api';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [openQRDialog, setOpenQRDialog] = useState(false);
  const [qrCode, setQrCode] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'employee'
  });

  useEffect(() => {
    fetchEmployees();
  }, [page, rowsPerPage]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await employeeService.listEmployees(page + 1, rowsPerPage);
      setEmployees(response.data.employees);
      setTotalEmployees(response.data.total);
    } catch (err) {
      setError('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (employee = null) => {
    if (employee) {
      setSelectedEmployee(employee);
      setFormData({
        username: employee.username,
        email: employee.email,
        password: '',
        role: employee.role
      });
    } else {
      setSelectedEmployee(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'employee'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEmployee(null);
    setError('');
  };

  const handleSubmit = async () => {
    try {
      if (selectedEmployee) {
        await employeeService.updateEmployee(selectedEmployee.id, formData);
        setSuccess('Employee updated successfully');
      } else {
        await employeeService.register(formData);
        setSuccess('Employee created successfully');
      }
      handleCloseDialog();
      fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save employee');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await employeeService.deleteEmployee(id);
        setSuccess('Employee deleted successfully');
        fetchEmployees();
      } catch (err) {
        setError('Failed to delete employee');
      }
    }
  };

  const handleShowQR = async (id) => {
    try {
      const response = await employeeService.getEmployeeQRCode(id);
      setQrCode(response.data.qrCode);
      setOpenQRDialog(true);
    } catch (err) {
      setError('Failed to fetch QR code');
    }
  };

  const handleRegenerateQR = async (id) => {
    try {
      const response = await employeeService.regenerateQRCode(id);
      setQrCode(response.data.qrCode);
      setSuccess('QR code regenerated successfully');
    } catch (err) {
      setError('Failed to regenerate QR code');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Employees</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Employee
        </Button>
      </Box>

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
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.username}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.role}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Show QR Code">
                      <IconButton onClick={() => handleShowQR(employee.id)}>
                        <QrCodeIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleOpenDialog(employee)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => handleDelete(employee.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalEmployees}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedEmployee ? 'Edit Employee' : 'Add Employee'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              margin="normal"
            />
            {!selectedEmployee && (
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                margin="normal"
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedEmployee ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openQRDialog} onClose={() => setOpenQRDialog(false)}>
        <DialogTitle>Employee QR Code</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {qrCode && (
              <img
                src={qrCode}
                alt="QR Code"
                style={{ width: '200px', height: '200px', marginBottom: '16px' }}
              />
            )}
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => handleRegenerateQR(selectedEmployee?.id)}
            >
              Regenerate QR Code
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenQRDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeList;
