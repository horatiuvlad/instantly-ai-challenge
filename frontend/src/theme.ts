import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#5B63F6',
    },
    secondary: {
      main: '#7A3CFB',
    },
    background: {
      default: '#FFFFFF',
      paper: '#F9FAFB',
    },
    text: {
      primary: '#0F1117',
      secondary: '#6B7280',
    },
    success: {
      main: '#2ECC71',
    },
    error: {
      main: '#E74C3C',
    },
    info: {
      main: '#1ED6FF',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

export const colors = {
  primary: '#5B63F6',
  secondary: '#7A3CFB',
  accent: '#1ED6FF',
  background: '#FFFFFF',
  surface: '#F9FAFB',
  textPrimary: '#0F1117',
  textSecondary: '#6B7280',
  success: '#2ECC71',
  danger: '#E74C3C',
};
