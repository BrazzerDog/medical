import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00ff9f', // неоновый зеленый
      light: '#4dffb8',
      dark: '#00cc7f',
    },
    secondary: {
      main: '#ff0055', // неоновый розовый
      light: '#ff4081',
      dark: '#c51162',
    },
    background: {
      default: '#0a192f', // темно-синий
      paper: '#172a45',
    },
    error: {
      main: '#ff3d00',
    },
    success: {
      main: '#00ff9f',
    },
    text: {
      primary: '#e6f1ff',
      secondary: '#8892b0',
    },
  },
  typography: {
    fontFamily: '"Rajdhani", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
    },
    h2: {
      fontWeight: 600,
      letterSpacing: '0.05em',
    },
    h3: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      letterSpacing: '0.1em',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          textTransform: 'uppercase',
          padding: '10px 25px',
          '&:hover': {
            boxShadow: '0 0 15px #00ff9f',
          },
        },
        contained: {
          background: 'linear-gradient(45deg, #00ff9f 30%, #00ccff 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #00ccff 30%, #00ff9f 90%)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(rgba(23, 42, 69, 0.7), rgba(23, 42, 69, 0.9))',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 255, 159, 0.1)',
          borderRadius: 4,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(10, 25, 47, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0, 255, 159, 0.1)',
        },
      },
    },
  },
}); 