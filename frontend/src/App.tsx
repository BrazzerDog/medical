import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import { Dashboard } from './components/Dashboard';
import { UsersList } from './components/UsersList';
import { MessageSender } from './components/MessageSender';
import { theme } from './theme';

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Box sx={{ flexGrow: 1, minHeight: '100vh', background: theme.palette.background.default }}>
            <AppBar position="static">
              <Toolbar>
                <Typography 
                  variant="h6" 
                  component="div" 
                  sx={{ 
                    flexGrow: 1,
                    fontFamily: '"Rajdhani", sans-serif',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    textShadow: `0 0 10px ${theme.palette.primary.main}`,
                  }}
                >
                  MedBot Control Center
                </Typography>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/"
                  sx={{ 
                    '&:hover': { 
                      textShadow: `0 0 10px ${theme.palette.primary.main}`,
                      backgroundColor: 'rgba(0, 255, 159, 0.1)'
                    }
                  }}
                >
                  Дашборд
                </Button>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/users"
                  sx={{ 
                    '&:hover': { 
                      textShadow: `0 0 10px ${theme.palette.primary.main}`,
                      backgroundColor: 'rgba(0, 255, 159, 0.1)'
                    }
                  }}
                >
                  Пользователи
                </Button>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/messages"
                  sx={{ 
                    '&:hover': { 
                      textShadow: `0 0 10px ${theme.palette.primary.main}`,
                      backgroundColor: 'rgba(0, 255, 159, 0.1)'
                    }
                  }}
                >
                  Сообщения
                </Button>
              </Toolbar>
            </AppBar>

            <Container maxWidth="xl">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/users" element={<UsersList />} />
                <Route path="/messages" element={<MessageSender />} />
              </Routes>
            </Container>
          </Box>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App; 