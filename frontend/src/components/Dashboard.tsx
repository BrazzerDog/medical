import React from 'react';
import { Grid, Paper, Typography, Box, CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { api, Statistics } from '../api/config';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const chartOptions = {
    plugins: {
        legend: {
            labels: {
                color: '#e6f1ff',
                font: {
                    family: '"Rajdhani", sans-serif',
                    size: 14
                }
            }
        }
    },
    scales: {
        y: {
            grid: {
                color: 'rgba(0, 255, 159, 0.1)',
            },
            ticks: {
                color: '#e6f1ff',
                font: {
                    family: '"Rajdhani", sans-serif'
                }
            }
        },
        x: {
            grid: {
                color: 'rgba(0, 255, 159, 0.1)',
            },
            ticks: {
                color: '#e6f1ff',
                font: {
                    family: '"Rajdhani", sans-serif'
                }
            }
        }
    }
};

export const Dashboard: React.FC = () => {
    const { data: stats, isLoading, error } = useQuery<Statistics>({
        queryKey: ['statistics'],
        queryFn: async () => {
            const response = await api.get('/statistics/extended/');
            return response.data;
        },
        retry: 1,
        staleTime: 30000,
    });

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress sx={{ color: '#00ff9f' }} />
            </Box>
        );
    }

    if (error || !stats) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <Typography color="error" variant="h6">
                    Ошибка загрузки статистики. Пожалуйста, попробуйте позже.
                </Typography>
            </Box>
        );
    }

    const specializationData = {
        labels: Object.keys(stats.specialization_types),
        datasets: [{
            label: 'Распределение по специализациям',
            data: Object.values(stats.specialization_types),
            backgroundColor: [
                'rgba(0, 255, 159, 0.6)',
                'rgba(0, 204, 255, 0.6)',
                'rgba(255, 0, 85, 0.6)',
            ],
            borderColor: [
                'rgba(0, 255, 159, 1)',
                'rgba(0, 204, 255, 1)',
                'rgba(255, 0, 85, 1)',
            ],
            borderWidth: 1
        }]
    };

    const passportData = {
        labels: ['Есть загранпаспорт', 'Нет загранпаспорта'],
        datasets: [{
            data: [
                stats.foreign_passport_distribution['true'] || 0,
                stats.foreign_passport_distribution['false'] || 0
            ],
            backgroundColor: [
                'rgba(0, 255, 159, 0.6)',
                'rgba(255, 0, 85, 0.6)',
            ],
            borderColor: [
                'rgba(0, 255, 159, 1)',
                'rgba(255, 0, 85, 1)',
            ],
            borderWidth: 1
        }]
    };

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
                Статистика системы
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6} lg={3}>
                    <Paper sx={{ 
                        p: 3,
                        background: 'linear-gradient(135deg, rgba(23, 42, 69, 0.9), rgba(10, 25, 47, 0.95))',
                        border: '1px solid rgba(0, 255, 159, 0.2)',
                        boxShadow: '0 0 20px rgba(0, 255, 159, 0.1)'
                    }}>
                        <Typography variant="h6" sx={{ color: '#8892b0' }}>
                            Всего пользователей
                        </Typography>
                        <Typography variant="h3" sx={{ 
                            color: '#00ff9f',
                            textShadow: '0 0 10px rgba(0, 255, 159, 0.5)',
                            fontFamily: '"Rajdhani", sans-serif'
                        }}>
                            {stats.total_unique_users}
                        </Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6} lg={3}>
                    <Paper sx={{ 
                        p: 3,
                        background: 'linear-gradient(135deg, rgba(23, 42, 69, 0.9), rgba(10, 25, 47, 0.95))',
                        border: '1px solid rgba(0, 255, 159, 0.2)',
                        boxShadow: '0 0 20px rgba(0, 255, 159, 0.1)'
                    }}>
                        <Typography variant="h6" sx={{ color: '#8892b0' }}>
                            Заполненных анкет
                        </Typography>
                        <Typography variant="h3" sx={{ 
                            color: '#00ff9f',
                            textShadow: '0 0 10px rgba(0, 255, 159, 0.5)',
                            fontFamily: '"Rajdhani", sans-serif'
                        }}>
                            {stats.total_forms_submitted}
                        </Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ 
                        p: 3,
                        background: 'linear-gradient(135deg, rgba(23, 42, 69, 0.9), rgba(10, 25, 47, 0.95))',
                        border: '1px solid rgba(0, 255, 159, 0.2)',
                        boxShadow: '0 0 20px rgba(0, 255, 159, 0.1)'
                    }}>
                        <Typography variant="h6" sx={{ color: '#8892b0', mb: 2 }}>
                            Специализации
                        </Typography>
                        <Box height={300}>
                            <Bar data={specializationData} options={chartOptions} />
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ 
                        p: 3,
                        background: 'linear-gradient(135deg, rgba(23, 42, 69, 0.9), rgba(10, 25, 47, 0.95))',
                        border: '1px solid rgba(0, 255, 159, 0.2)',
                        boxShadow: '0 0 20px rgba(0, 255, 159, 0.1)'
                    }}>
                        <Typography variant="h6" sx={{ color: '#8892b0', mb: 2 }}>
                            Загранпаспорта
                        </Typography>
                        <Box height={300}>
                            <Doughnut data={passportData} options={chartOptions} />
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}; 