import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Box,
  Chip
} from '@mui/material';
import moment from 'moment';

const DailyMenuSelection = ({ 
  date, 
  menus, 
  selections, 
  onSelectionChange 
}) => {
  const mealTypes = ['breakfast', 'lunch', 'dinner'];
  const formatDate = (date) => moment(date).format('dddd, MMMM D');

  const handleDishSelection = (mealType, selectedDish) => {
    onSelectionChange(date, mealType, {
      menuId: menus[mealType]?.id,
      selectedDish,
      specialRequirements: selections[mealType]?.specialRequirements || ''
    });
  };

  const handleSpecialRequirements = (mealType, requirements) => {
    onSelectionChange(date, mealType, {
      ...selections[mealType],
      specialRequirements: requirements
    });
  };

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {formatDate(date)}
        </Typography>

        {mealTypes.map((mealType) => {
          const menu = menus[mealType];
          const selection = selections[mealType];

          if (!menu) return null;

          return (
            <Box key={mealType} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
              </Typography>

              <FormControl component="fieldset">
                <RadioGroup
                  value={selection?.selectedDish || ''}
                  onChange={(e) => handleDishSelection(mealType, e.target.value)}
                >
                  <FormControlLabel
                    value="main"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body1">{menu.main_dish}</Typography>
                      </Box>
                    }
                  />
                  {menu.alternative_dish && (
                    <FormControlLabel
                      value="alternative"
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="body1">
                            {menu.alternative_dish}
                          </Typography>
                        </Box>
                      }
                    />
                  )}
                </RadioGroup>
              </FormControl>

              {menu.special_diet_options && (
                <Box sx={{ mt: 1, mb: 1 }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Opciones de dieta especial disponibles:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {menu.special_diet_options.map((option, index) => (
                      <Chip
                        key={index}
                        label={option}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}

              <TextField
                fullWidth
                margin="normal"
                size="small"
                label="Requerimientos especiales"
                value={selection?.specialRequirements || ''}
                onChange={(e) => 
                  handleSpecialRequirements(mealType, e.target.value)
                }
                helperText="Indique alergias o requerimientos dietéticos especiales"
              />

              {menu.dessert && (
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Postre: {menu.dessert}
                </Typography>
              )}
            </Box>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default DailyMenuSelection;
