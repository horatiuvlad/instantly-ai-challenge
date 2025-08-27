import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Typography,
  Fab,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { ComposeEmailModal } from '../components/ComposeEmailModal';
import { EmailService } from '../services/emailService';
import { Email } from '../types/email';

export default function Home() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | undefined>(undefined);
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const theme = useTheme();

  const fetchEmails = async () => {
    try {
      setError(undefined);
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
        setError(undefined);
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
        setSelectedEmail(undefined);
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
      height: '100%',
      bgcolor: theme.palette.background.default,
      gap: { xs: 1, sm: 2 },
      p: { xs: 1, sm: 2 },
      flexDirection: { xs: 'column', md: 'row' }, // Stack vertically on mobile
    }}>
      {/* Email Sidebar Card */}
      <Card sx={{ 
        width: { xs: '100%', md: 400 }, 
        height: { xs: '40vh', md: 'calc(100vh - 32px)' }, // Responsive height
        display: 'flex',
        flexDirection: 'column',
      }}>
        <CardContent sx={{ 
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 2,
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Emails ({emails.length})
          </Typography>
          <IconButton onClick={fetchEmails} size="small">
            <RefreshIcon />
          </IconButton>
        </CardContent>

        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        <CardContent sx={{ flex: 1, overflow: 'hidden', pl: 2, pr: 2, pt: 2, pb: 0 }}>
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
            <List sx={{ height: '100%', overflow: 'auto', p: 0 }}>
              {emails.map((email) => (
                <ListItem
                  key={email.id}
                  onClick={() => handleEmailSelect(email)}
                  sx={{
                    cursor: 'pointer',
                    bgcolor: selectedEmail?.id === email.id ? theme.palette.action.selected : 'transparent',
                    '&:hover': {
                      bgcolor: theme.palette.action.hover,
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
                            '&:hover': { opacity: 1, color: 'error.main' }
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
                          sx={{ color: 'text.secondary', mb: 0.5 }}
                        >
                          To: {truncateText(email.to, 25)}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ color: 'text.secondary', mb: 1 }}
                        >
                          {truncateText(email.body, 60)}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ color: 'text.secondary' }}
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
        </CardContent>
      </Card>

      {/* Main Content Card */}
      <Card sx={{ 
        flex: 1, 
        height: { xs: '55vh', md: 'calc(100vh - 32px)' }, // Responsive height
        minHeight: { xs: '300px', md: 'auto' },
      }}>
        {selectedEmail ? (
          <CardContent sx={{ height: '100%', overflow: 'auto' }}>
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 2,
                  fontSize: { xs: '1.25rem', md: '1.5rem' } // Responsive font size
                }}
              >
                {selectedEmail.subject}
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                  <strong>To:</strong> {selectedEmail.to}
                </Typography>
                {selectedEmail.cc && (
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                    <strong>CC:</strong> {selectedEmail.cc}
                  </Typography>
                )}
                {selectedEmail.bcc && (
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                    <strong>BCC:</strong> {selectedEmail.bcc}
                  </Typography>
                )}
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  <strong>Date:</strong> {formatDate(selectedEmail.created_at)}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />
            </Box>

            <Typography 
              variant="body1" 
              sx={{ 
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
                fontSize: { xs: '0.875rem', md: '1rem' }, // Responsive font size
              }}
            >
              {selectedEmail.body}
            </Typography>
          </CardContent>
        ) : (
          <CardContent sx={{ 
            height: '100%',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
          }}>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              textAlign="center"
              sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }} // Responsive font size
            >
              Select an email to view its content
            </Typography>
          </CardContent>
        )}
      </Card>

      {/* Compose FAB */}
      <Fab
        color="primary"
        onClick={() => setIsComposeModalOpen(true)}
        sx={{
          position: 'fixed',
          bottom: { xs: 16, md: 24 },
          right: { xs: 16, md: 24 },
          zIndex: 1000,
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
