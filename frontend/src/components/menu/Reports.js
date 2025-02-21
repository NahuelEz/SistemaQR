import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { mealService } from '../../services/api';
import moment from 'moment';

const Reports = () => {
  const [startDate, setStartDate] = useState(moment().startOf('week').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(moment().endOf('week').format('YYYY-MM-DD'));
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dailyRegistrations, setDailyRegistrations] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsResponse, registrationsResponse] = await Promise.all([
        mealService.getRegistrationStats(startDate, endDate),
        mealService.getDailyRegistrations(moment().format('YYYY-MM-DD'))
      ]);

      setStats(statsResponse.data);
      setDailyRegistrations(registrationsResponse.data);
    } catch (err) {
      setError('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = () => {
    fetchReports();
  };

  const prepareChartData = () => {
    const chartData = [];
    const groupedStats = stats.reduce((acc, stat) => {
      const date = moment(stat.date).format('MM/DD');
      if (!acc[date]) {
        acc[date] = {
          date,
          breakfast: 0,
          lunch: 0,
          snack: 0,
          dinner: 0
        };
      }
      acc[date][stat.meal_type] = stat.total_registrations;
      return acc;
    }, {});

    return Object.values(groupedStats);
  };

  const calculateTotalsByMealType = () => {
    return stats.reduce((acc, stat) => {
      acc[stat.meal_type] = (acc[stat.meal_type] || 0) + stat.total_registrations;
      return acc;
    }, {});
  };

  const totals = calculateTotalsByMealType();

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Meal Registration Reports
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <TextField
            type="date"
            label="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            type="date"
            label="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Button
            variant="contained"
            onClick={handleDateChange}
            disabled={loading}
            sx={{ height: '56px' }}
            fullWidth
          >
            Generate Report
          </Button>
        </Grid>
      </Grid>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {Object.entries(totals).map(([mealType, total]) => (
              <Grid item xs={12} sm={6} md={3} key={mealType}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Total {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                    </Typography>
                    <Typography variant="h4">{total}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Meal Registrations Over Time
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prepareChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="breakfast" fill="#8884d8" name="Breakfast" />
                  <Bar dataKey="lunch" fill="#82ca9d" name="Lunch" />
                  <Bar dataKey="snack" fill="#ffc658" name="Snack" />
                  <Bar dataKey="dinner" fill="#ff7300" name="Dinner" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Today's Registrations
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Time</TableCell>
                    <TableCell>Employee</TableCell>
                    <TableCell>Meal Type</TableCell>
                    <TableCell>Selected Dish</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dailyRegistrations.map((registration) => (
                    <TableRow key={registration.id}>
                      <TableCell>
                        {moment(registration.registration_time).format('HH:mm')}
                      </TableCell>
                      <TableCell>{registration.username}</TableCell>
                      <TableCell>
                        {registration.meal_type.charAt(0).toUpperCase() + 
                         registration.meal_type.slice(1)}
                      </TableCell>
                      <TableCell>{registration.selected_dish || 'Main Dish'}</TableCell>
                    </TableRow>
                  ))}
                  {dailyRegistrations.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No registrations for today
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default Reports;
