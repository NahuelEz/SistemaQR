import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Box,
  Paper,
  Snackbar
} from '@mui/material';
import moment from 'moment';
import 'moment/locale/es';
import DailyMenuSelection from './DailyMenuSelection';
import { weeklyMenuSelectionService } from '../../services/weeklyMenuSelection';

moment.locale('es');

const WeeklyMenuSelection = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [availableMenus, setAvailableMenus] = useState({});
  const [selections, setSelections] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isToday = (date) => moment(date).isSame(moment(), 'day');
  const isSunday = () => moment().day() === 0;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar menús disponibles y selecciones actuales
      const [menusResponse, selectionsResponse] = await Promise.all([
        weeklyMenuSelectionService.getAvailableMenus(),
        weeklyMenuSelectionService.getCurrentSelections()
      ]);

      setAvailableMenus(menusResponse.data);

      // Organizar las selecciones por fecha y tipo de comida
      const organizedSelections = {};
      selectionsResponse.data.forEach(selection => {
        const date = moment(selection.date).format('YYYY-MM-DD');
        if (!organizedSelections[date]) {
          organizedSelections[date] = {};
        }
        organizedSelections[date][selection.meal_type] = {
          menuId: selection.menu_id,
          selectedDish: selection.selected_dish,
          specialRequirements: selection.special_requirements
        };
      });

      setSelections(organizedSelections);
    } catch (err) {
      setError(err.message || 'Error al cargar los menús');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectionChange = (date, mealType, selection) => {
    setSelections(prev => ({
      ...prev,
      [date]: {
        ...prev[date],
        [mealType]: selection
      }
    }));
  };

  const handleSubmit = async () => {
    if (!isSunday()) {
      setError('Las selecciones solo pueden realizarse los domingos');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Transformar selecciones al formato esperado por la API
      const selectionsArray = Object.entries(selections).flatMap(([date, mealTypes]) =>
        Object.entries(mealTypes).map(([mealType, selection]) => ({
          menuId: selection.menuId,
          selectedDish: selection.selectedDish,
          specialRequirements: selection.specialRequirements
        }))
      );

      await weeklyMenuSelectionService.createSelections(selectionsArray);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Error al guardar las selecciones');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Selección Semanal de Menús
        </Typography>

        {!isSunday() && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Recuerda que las selecciones de menú solo pueden realizarse los domingos.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {Object.keys(availableMenus).map(date => (
          <DailyMenuSelection
            key={date}
            date={date}
            menus={availableMenus[date]}
            selections={selections[date] || {}}
            onSelectionChange={handleSelectionChange}
          />
        ))}

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={isSubmitting || !isSunday()}
          >
            {isSubmitting ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                Guardando...
              </>
            ) : (
              'Guardar Selecciones'
            )}
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          ¡Selecciones guardadas exitosamente!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default WeeklyMenuSelection;
