import { useState, useEffect } from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import EmailSidebar from '../components/EmailSidebar';
import EmailViewer from '../components/EmailViewer';
import ComposeButton from '../components/ComposeButton';
import ComposeDialog from '../components/ComposeDialog';
import axios from 'axios';

// Custom theme with eye-pleasing color palette
const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb', // Modern blue
      light: '#3b82f6',
      dark: '#1d4ed8',
    },
    secondary: {
      main: '#7c3aed', // Purple accent
      light: '#8b5cf6',
      dark: '#6d28d9',
    },
    background: {
      default: '#f8fafc', // Light gray background
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
    divider: '#e2e8f0',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        },
      },
    },
  },
});

const API_BASE_URL = 'http://localhost:3001';

export default function Home() {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch emails from backend
  const fetchEmails = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/emails`);
      if (response.data.success) {
        setEmails(response.data.emails);
        // Auto-select first email if none selected
        if (!selectedEmail && response.data.emails.length > 0) {
          setSelectedEmail(response.data.emails[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch emails:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create new email
  const handleCreateEmail = async (emailData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/emails`, emailData);
      if (response.data.success) {
        await fetchEmails(); // Refresh the list
        setSelectedEmail(response.data.email); // Select the new email
        setComposeOpen(false);
      }
    } catch (error) {
      console.error('Failed to create email:', error);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
        {/* Email Sidebar */}
        <EmailSidebar
          emails={emails}
          selectedEmail={selectedEmail}
          onEmailSelect={setSelectedEmail}
          loading={loading}
        />
        
        {/* Email Viewer */}
        <EmailViewer
          email={selectedEmail}
          loading={loading}
        />
        
        {/* Compose Button */}
        <ComposeButton onClick={() => setComposeOpen(true)} />
        
        {/* Compose Dialog */}
        <ComposeDialog
          open={composeOpen}
          onClose={() => setComposeOpen(false)}
          onSend={handleCreateEmail}
        />
      </Box>
    </ThemeProvider>
  );
}
