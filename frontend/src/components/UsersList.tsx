import React, { useState } from 'react';
import { 
    DataGrid, 
    GridColDef,
} from '@mui/x-data-grid';
import { 
    Box, 
    Paper, 
    Typography, 
    Button, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions,
    CircularProgress,
    Chip
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { api, User } from '../api/config';

const columns: GridColDef[] = [
    { 
        field: 'telegram_id', 
        headerName: 'ID', 
        width: 100,
        headerClassName: 'super-app-theme--header'
    },
    { 
        field: 'full_name', 
        headerName: 'ФИО', 
        width: 200,
        headerClassName: 'super-app-theme--header'
    },
    { 
        field: 'age', 
        headerName: 'Возраст', 
        width: 100,
        headerClassName: 'super-app-theme--header'
    },
    { 
        field: 'specialization_type', 
        headerName: 'Специализация', 
        width: 150,
        headerClassName: 'super-app-theme--header',
        renderCell: (params) => (
            <Chip
                label={params.value}
                sx={{
                    backgroundColor: 'rgba(0, 255, 159, 0.1)',
                    color: '#00ff9f',
                    border: '1px solid rgba(0, 255, 159, 0.3)',
                    '& .MuiChip-label': {
                        fontFamily: '"Rajdhani", sans-serif',
                    }
                }}
            />
        )
    },
    { 
        field: 'has_foreign_passport', 
        headerName: 'Загранпаспорт', 
        width: 130,
        headerClassName: 'super-app-theme--header',
        renderCell: (params) => (
            <Chip
                label={params.value ? 'Есть' : 'Нет'}
                sx={{
                    backgroundColor: params.value 
                        ? 'rgba(0, 255, 159, 0.1)' 
                        : 'rgba(255, 0, 85, 0.1)',
                    color: params.value ? '#00ff9f' : '#ff0055',
                    border: `1px solid ${params.value 
                        ? 'rgba(0, 255, 159, 0.3)' 
                        : 'rgba(255, 0, 85, 0.3)'}`,
                    '& .MuiChip-label': {
                        fontFamily: '"Rajdhani", sans-serif',
                    }
                }}
            />
        )
    },
    { 
        field: 'contact_info', 
        headerName: 'Контакт', 
        width: 150,
        headerClassName: 'super-app-theme--header'
    },
    { 
        field: 'created_at', 
        headerName: 'Дата регистрации', 
        width: 200,
        headerClassName: 'super-app-theme--header',
        valueFormatter: (params) => new Date(params.value).toLocaleString()
    },
];

export const UsersList: React.FC = () => {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const { data: users, isLoading } = useQuery<User[]>({
        queryKey: ['users'],
        queryFn: async () => {
            const response = await api.get('/users');
            return response.data;
        }
    });

    const handleRowClick = (params: any) => {
        setSelectedUser(params.row);
        setDialogOpen(true);
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress sx={{ color: '#00ff9f' }} />
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Typography 
                variant="h4" 
                gutterBottom 
                sx={{ 
                    color: '#00ff9f',
                    textShadow: '0 0 10px rgba(0, 255, 159, 0.5)',
                    fontFamily: '"Rajdhani", sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    mb: 4
                }}
            >
                База специалистов
            </Typography>

            <Paper sx={{ 
                width: '100%', 
                overflow: 'hidden',
                background: 'linear-gradient(135deg, rgba(23, 42, 69, 0.9), rgba(10, 25, 47, 0.95))',
                border: '1px solid rgba(0, 255, 159, 0.2)',
                boxShadow: '0 0 20px rgba(0, 255, 159, 0.1)'
            }}>
                <DataGrid
                    rows={users || []}
                    columns={columns}
                    getRowId={(row) => row.telegram_id}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10 } },
                    }}
                    pageSizeOptions={[10, 25, 50]}
                    onRowClick={handleRowClick}
                    autoHeight
                    loading={isLoading}
                    sx={{
                        border: 'none',
                        '& .MuiDataGrid-cell': {
                            color: '#e6f1ff',
                            fontFamily: '"Rajdhani", sans-serif',
                            fontSize: '1rem',
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: 'rgba(0, 255, 159, 0.1)',
                            color: '#00ff9f',
                            fontFamily: '"Rajdhani", sans-serif',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                        },
                        '& .MuiDataGrid-row': {
                            '&:hover': {
                                backgroundColor: 'rgba(0, 255, 159, 0.05)',
                                cursor: 'pointer',
                            },
                        },
                        '& .MuiDataGrid-footerContainer': {
                            backgroundColor: 'rgba(0, 255, 159, 0.1)',
                            borderTop: '1px solid rgba(0, 255, 159, 0.2)',
                        },
                        '& .MuiTablePagination-root': {
                            color: '#e6f1ff',
                        },
                        '& .MuiDataGrid-virtualScroller::-webkit-scrollbar': {
                            width: '8px',
                            height: '8px',
                        },
                        '& .MuiDataGrid-virtualScroller::-webkit-scrollbar-track': {
                            background: 'rgba(0, 255, 159, 0.1)',
                        },
                        '& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb': {
                            backgroundColor: 'rgba(0, 255, 159, 0.3)',
                            borderRadius: '4px',
                            '&:hover': {
                                backgroundColor: 'rgba(0, 255, 159, 0.5)',
                            },
                        },
                    }}
                />
            </Paper>

            <Dialog 
                open={dialogOpen} 
                onClose={() => setDialogOpen(false)} 
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
                    fontFamily: '"Rajdhani", sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    borderBottom: '1px solid rgba(0, 255, 159, 0.2)',
                }}>
                    Детальная информация
                </DialogTitle>
                <DialogContent>
                    {selectedUser && (
                        <Box sx={{ p: 2 }}>
                            {Object.entries(selectedUser).map(([key, value]) => {
                                if (key === 'id') return null;
                                return (
                                    <Typography 
                                        key={key} 
                                        sx={{ 
                                            mb: 1,
                                            color: '#e6f1ff',
                                            fontFamily: '"Rajdhani", sans-serif',
                                            '& strong': {
                                                color: '#00ff9f',
                                                textShadow: '0 0 5px rgba(0, 255, 159, 0.3)',
                                            }
                                        }}
                                    >
                                        <strong>{key}:</strong> {
                                            typeof value === 'boolean' 
                                                ? (value ? 'Да' : 'Нет')
                                                : value
                                        }
                                    </Typography>
                                );
                            })}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ borderTop: '1px solid rgba(0, 255, 159, 0.2)' }}>
                    <Button 
                        onClick={() => setDialogOpen(false)}
                        sx={{
                            color: '#00ff9f',
                            borderColor: '#00ff9f',
                            '&:hover': {
                                backgroundColor: 'rgba(0, 255, 159, 0.1)',
                                borderColor: '#00ff9f',
                                boxShadow: '0 0 10px rgba(0, 255, 159, 0.3)',
                            }
                        }}
                    >
                        Закрыть
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}; 