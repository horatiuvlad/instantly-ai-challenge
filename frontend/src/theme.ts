import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1179fc', // royal-blue
    },
    secondary: {
      main: '#dc82fc', // violet
    },
    background: {
      default: '#ffffff', // white
      paper: '#f6f8fb', // white-smoke
    },
    text: {
      primary: '#0f0f0f', // black-3
      secondary: '#0f0f0f99', // black-4
    },
    success: {
      main: '#2ECC71',
    },
    error: {
      main: '#E74C3C',
    },
    info: {
      main: '#1179fc', // royal-blue
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
  black: '#000000',
  black3: '#0f0f0f',
  royalBlue: '#1179fc',
  white: '#ffffff',
  black4: '#0f0f0f99',
  black2: '#050917',
  white2: '#ffffff40',
  black5: '#0f0f0fa6',
  violet: '#dc82fc',
  violet2: '#dd83fc',
  whiteSmoke: '#f6f8fb',
};
