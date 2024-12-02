import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Grid,
  useTheme,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api, User, SpecializationType, DoctorSpecialization, OtherSpecialization } from '../api/config';
import { Send as SendIcon, FilterList as FilterIcon } from '@mui/icons-material';

const RecipientsList: React.FC<{ 
  users: User[], 
  selectedUsers: number[],
  onClose: () => void 
}> = ({ users, selectedUsers, onClose }) => {
  const filteredUsers = users.filter(user => selectedUsers.includes(user.telegram_id));
  
  return (
    <Dialog 
      open={true} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, rgba(23, 42, 69, 0.95), rgba(10, 25, 47, 0.98))',
          border: '1px solid rgba(0, 255, 159, 0.2)',
          boxShadow: '0 0 30px rgba(0, 255, 159, 0.1)',
        }
      }}
    >
      <DialogTitle sx={{ 
        color: '#00ff9f',
        borderBottom: '1px solid rgba(0, 255, 159, 0.2)',
      }}>
        Список получателей ({filteredUsers.length})
      </DialogTitle>
      <DialogContent>
        <Box sx={{ 
          maxHeight: '400px', 
          overflowY: 'auto',
          mt: 2,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(0, 255, 159, 0.1)',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0, 255, 159, 0.3)',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: 'rgba(0, 255, 159, 0.5)',
            },
          },
        }}>
          {filteredUsers.map((user) => (
            <Box 
              key={user.telegram_id} 
              sx={{ 
                p: 1, 
                m: 1, 
                border: '1px solid rgba(0, 255, 159, 0.2)',
                borderRadius: 1,
                background: 'rgba(0, 255, 159, 0.05)',
              }}
            >
              <Typography sx={{ color: '#e6f1ff' }}>
                {user.full_name} ({user.specialization_type}
                {user.doctor_specialization ? ` - ${user.doctor_specialization}` :
                 user.other_specialization ? ` - ${user.other_specialization}` : ''}
                )
              </Typography>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose}
          sx={{
            color: '#00ff9f',
            borderColor: 'rgba(0, 255, 159, 0.3)',
            '&:hover': {
              borderColor: '#00ff9f',
              backgroundColor: 'rgba(0, 255, 159, 0.1)',
            }
          }}
        >
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const MessageSender: React.FC = () => {
  const theme = useTheme();
  const [message, setMessage] = useState('');
  const [selectedType, setSelectedType] = useState<SpecializationType | ''>('');
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [hasPassport, setHasPassport] = useState<boolean | null>(null);
  const [hasTravelRestrictions, setHasTravelRestrictions] = useState<boolean | null>(null);
  const [showRecipients, setShowRecipients] = useState(false);

  const { data: users } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users');
      return response.data;
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: { text: string; user_ids: number[] }) => {
      return await api.post('/send-message/', data);
    },
    onSuccess: () => {
      setSnackbar({
        open: true,
        message: 'Сообщение успешно отправлено',
        severity: 'success'
      });
      setMessage('');
    },
    onError: () => {
      setSnackbar({
        open: true,
        message: 'Ошибка при отправке сообщения',
        severity: 'error'
      });
    }
  });

  const handleSpecTypeChange = (event: SelectChangeEvent) => {
    const type = event.target.value as SpecializationType;
    setSelectedType(type);
    setSelectedSpecialization('');
    updateSelectedUsers(type, '', hasPassport, hasTravelRestrictions);
  };

  const handleSpecializationChange = (event: SelectChangeEvent) => {
    const spec = event.target.value;
    setSelectedSpecialization(spec);
    updateSelectedUsers(selectedType, spec, hasPassport, hasTravelRestrictions);
  };

  const updateSelectedUsers = (
    type: SpecializationType | '', 
    specialization: string,
    passport: boolean | null,
    restrictions: boolean | null
  ) => {
    if (!users) return;

    let filteredUsers = users.filter(user => {
      let matches = true;

      // Фильтр по типу специализации
      if (type) {
        matches = matches && user.specialization_type === type;
      }

      // Фильтр по конкретной специализации
      if (specialization) {
        if (type === SpecializationType.DOCTOR) {
          matches = matches && user.doctor_specialization === specialization;
        } else if (type === SpecializationType.OTHER) {
          matches = matches && user.other_specialization === specialization;
        }
      }

      // Фильтр по загранпаспорту
      if (passport !== null) {
        matches = matches && user.has_foreign_passport === passport;
      }

      // Фильтр по ограничениям на выезд
      if (restrictions !== null) {
        matches = matches && user.has_travel_restrictions === restrictions;
      }

      return matches;
    });

    // Логируем для отладки
    console.log('Filtered Users:', {
      type,
      specialization,
      passport,
      restrictions,
      totalUsers: users.length,
      filteredCount: filteredUsers.length,
      filteredUsers: filteredUsers.map(u => ({
        id: u.telegram_id,
        name: u.full_name,
        spec: u.specialization_type,
        docSpec: u.doctor_specialization,
        otherSpec: u.other_specialization
      }))
    });

    setSelectedUsers(filteredUsers.map(user => user.telegram_id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUsers.length === 0) {
      setSnackbar({
        open: true,
        message: 'Выберите получателей сообщения',
        severity: 'error'
      });
      return;
    }
    mutation.mutate({
      text: message,
      user_ids: selectedUsers
    });
  };

  const getSpecializationOptions = () => {
    if (selectedType === SpecializationType.DOCTOR) {
      return Object.entries(DoctorSpecialization).map(([key, value]) => (
        <MenuItem key={key} value={value}>{value}</MenuItem>
      ));
    } else if (selectedType === SpecializationType.OTHER) {
      return Object.entries(OtherSpecialization).map(([key, value]) => (
        <MenuItem key={key} value={value}>{value}</MenuItem>
      ));
    }
    return null;
  };

  return (
    <Box p={3}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ 
          color: theme.palette.primary.main,
          textShadow: `0 0 10px ${theme.palette.primary.main}`,
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <FilterIcon /> Фильтры получателей
        </Typography>

        <Grid container spacing={3}>
          {/* Основной тип специализации */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Тип специализации</InputLabel>
              <Select
                value={selectedType}
                onChange={handleSpecTypeChange}
                label="Тип специализации"
              >
                <MenuItem value={SpecializationType.DOCTOR}>Врачи</MenuItem>
                <MenuItem value={SpecializationType.PARAMEDIC}>Фельдшеры</MenuItem>
                <MenuItem value={SpecializationType.OTHER}>Другие специалисты</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Конкретная специализация */}
          {selectedType && selectedType !== SpecializationType.PARAMEDIC && (
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Специализация</InputLabel>
                <Select
                  value={selectedSpecialization}
                  onChange={handleSpecializationChange}
                  label="Специализация"
                >
                  <MenuItem value="">Все специализации</MenuItem>
                  {getSpecializationOptions()}
                </Select>
              </FormControl>
            </Grid>
          )}

          {/* Фильтры по загранпаспорту и ограничениям */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Загранпаспорт</InputLabel>
              <Select
                value={hasPassport === null ? '' : hasPassport.toString()}
                onChange={(e) => {
                  const value = e.target.value === '' ? null : e.target.value === 'true';
                  setHasPassport(value);
                  updateSelectedUsers(selectedType, selectedSpecialization, value, hasTravelRestrictions);
                }}
                label="Загранпаспорт"
              >
                <MenuItem value="">Не важно</MenuItem>
                <MenuItem value="true">Есть</MenuItem>
                <MenuItem value="false">Нет</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Ограничения на выезд</InputLabel>
              <Select
                value={hasTravelRestrictions === null ? '' : hasTravelRestrictions.toString()}
                onChange={(e) => {
                  const value = e.target.value === '' ? null : e.target.value === 'true';
                  setHasTravelRestrictions(value);
                  updateSelectedUsers(selectedType, selectedSpecialization, hasPassport, value);
                }}
                label="Ограничения на выезд"
              >
                <MenuItem value="">Не важно</MenuItem>
                <MenuItem value="true">Есть</MenuItem>
                <MenuItem value="false">Нет</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: 'rgba(0, 255, 159, 0.2)' }} />

        {/* Заменяем список чипов на информацию о количестве и кнопку просмотра */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 2 
          }}>
            <Typography variant="subtitle1" sx={{ color: theme.palette.primary.main }}>
              Выбрано получателей: {selectedUsers.length}
            </Typography>
            {selectedUsers.length > 0 && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => setShowRecipients(true)}
                sx={{
                  color: '#00ff9f',
                  borderColor: 'rgba(0, 255, 159, 0.3)',
                  '&:hover': {
                    borderColor: '#00ff9f',
                    backgroundColor: 'rgba(0, 255, 159, 0.1)',
                  }
                }}
              >
                Просмотреть список
              </Button>
            )}
          </Box>
        </Box>

        {/* Форма отправки сообщения */}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Текст сообщения"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(0, 255, 159, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(0, 255, 159, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main,
                },
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={!message || mutation.isPending || selectedUsers.length === 0}
            startIcon={<SendIcon />}
            sx={{
              mt: 2,
              background: 'linear-gradient(45deg, #00ff9f 30%, #00ccff 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #00ccff 30%, #00ff9f 90%)',
                boxShadow: '0 0 15px #00ff9f',
              },
            }}
          >
            Отправить ({selectedUsers.length} получателей)
          </Button>
        </form>
      </Paper>

      {showRecipients && users && (
        <RecipientsList
          users={users}
          selectedUsers={selectedUsers}
          onClose={() => setShowRecipients(false)}
        />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}; 