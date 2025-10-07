import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#424242', // 濃いグレー
    },
    secondary: {
      main: '#1976D2', // 落ち着いた紺色
    },
    success: {
      main: '#4CAF50', // 緑
    },
    error: {
      main: '#F44336', // 赤
    },
    background: {
      default: '#F5F5F5', // 非常に薄いグレー
      paper: '#FFFFFF', // 白
    },
  },
  typography: {
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
    },
    h4: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 'bold',
    },
    body1: {
      fontWeight: 500,
    },
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(224, 224, 224, 1)',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(odd)': {
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&:hover': {
            backgroundColor: '#1565C0', // secondary.dark
          },
        },
      },
    },
  },
});

export default theme;