import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Typography,
  Fab,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { ComposeEmailModal } from '../components/ComposeEmailModal';
import { EmailService } from '../services/emailService';
import { Email } from '../types/email';
import { colors } from '../theme';

export default function Home() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmails = async () => {
    try {
      setError(null);
      const emailsData = await EmailService.getEmails();
      setEmails(emailsData);
      
      // Auto-select the first email if none selected and we have emails
      if (emailsData.length > 0) {
        setSelectedEmail(emailsData[0]);
      }
    } catch (error) {
      setError('Failed to fetch emails');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchEmailsOnMount = async () => {
      try {
        setError(null);
        const emailsData = await EmailService.getEmails();
        setEmails(emailsData);
        
        // Auto-select the first email if none selected and we have emails
        if (emailsData.length > 0) {
          setSelectedEmail(emailsData[0]);
        }
      } catch (error) {
        setError('Failed to fetch emails');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmailsOnMount();
  }, []);

  const handleEmailSelect = (email: Email) => {
    setSelectedEmail(email);
  };

  const handleEmailSent = () => {
    fetchEmails();
  };

  const handleDeleteEmail = async (emailId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    
    try {
      await EmailService.deleteEmail(emailId);
      if (selectedEmail?.id === emailId) {
        setSelectedEmail(null);
      }
      fetchEmails();
    } catch (error) {
      setError('Failed to delete email');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh', 
      bgcolor: colors.white,
      marginLeft: '60px', // Account for the left sidebar
    }}>
      {/* Email Sidebar */}
      <Paper sx={{ 
        width: 400, 
        height: '100vh',
        borderRadius: 0,
        bgcolor: colors.whiteSmoke,
        borderRight: `1px solid ${colors.black4}`,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Box sx={{ 
          p: 2, 
          borderBottom: `1px solid ${colors.black4}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Typography variant="h6" sx={{ color: colors.black3, fontWeight: 600 }}>
            Emails ({emails.length})
          </Typography>
          <IconButton onClick={fetchEmails} size="small">
            <RefreshIcon />
          </IconButton>
        </Box>

        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : emails.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No emails yet. Compose your first email!
            </Typography>
          </Box>
        ) : (
          <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
            {emails.map((email) => (
              <ListItem
                key={email.id}
                onClick={() => handleEmailSelect(email)}
                sx={{
                  cursor: 'pointer',
                  bgcolor: selectedEmail?.id === email.id ? `${colors.royalBlue}15` : 'transparent',
                  borderLeft: selectedEmail?.id === email.id ? `3px solid ${colors.royalBlue}` : '3px solid transparent',
                  '&:hover': {
                    bgcolor: `${colors.royalBlue}08`,
                  },
                  px: 2,
                  py: 1.5,
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          fontWeight: 600,
                          color: colors.black3,
                          flex: 1,
                          mr: 1,
                        }}
                      >
                        {truncateText(email.subject, 30)}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => handleDeleteEmail(email.id, e)}
                        sx={{ 
                          opacity: 0.6,
                          '&:hover': { opacity: 1, color: '#E74C3C' }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography 
                        variant="body2" 
                        sx={{ color: colors.black4, mb: 0.5 }}
                      >
                        To: {truncateText(email.to, 25)}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ color: colors.black4, mb: 1 }}
                      >
                        {truncateText(email.body, 60)}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ color: colors.black4 }}
                      >
                        {formatDate(email.created_at)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedEmail ? (
          <Paper sx={{ 
            flex: 1, 
            m: 2, 
            p: 3,
            borderRadius: 3,
            bgcolor: colors.white,
          }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" sx={{ color: colors.black3, fontWeight: 600, mb: 2 }}>
                {selectedEmail.subject}
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: colors.black4, mb: 0.5 }}>
                  <strong>To:</strong> {selectedEmail.to}
                </Typography>
                {selectedEmail.cc && (
                  <Typography variant="body2" sx={{ color: colors.black4, mb: 0.5 }}>
                    <strong>CC:</strong> {selectedEmail.cc}
                  </Typography>
                )}
                {selectedEmail.bcc && (
                  <Typography variant="body2" sx={{ color: colors.black4, mb: 0.5 }}>
                    <strong>BCC:</strong> {selectedEmail.bcc}
                  </Typography>
                )}
                <Typography variant="body2" sx={{ color: colors.black4 }}>
                  <strong>Date:</strong> {formatDate(selectedEmail.created_at)}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />
            </Box>

            <Typography 
              variant="body1" 
              sx={{ 
                color: colors.black3,
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
              }}
            >
              {selectedEmail.body}
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: colors.black4,
          }}>
            <Typography variant="h6">
              Select an email to view its content
            </Typography>
          </Box>
        )}
      </Box>

      {/* Compose FAB */}
      <Fab
        color="primary"
        onClick={() => setIsComposeModalOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          bgcolor: colors.royalBlue,
          '&:hover': {
            bgcolor: colors.violet,
          },
        }}
      >
        <EditIcon />
      </Fab>

      {/* Compose Modal */}
      <ComposeEmailModal
        open={isComposeModalOpen}
        onClose={() => setIsComposeModalOpen(false)}
        onEmailSent={handleEmailSent}
      />
    </Box>
  );
}
