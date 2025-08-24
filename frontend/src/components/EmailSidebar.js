import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Skeleton,
  Paper,
  Chip,
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';

export default function EmailSidebar({ emails, selectedEmail, onEmailSelect, loading }) {
  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (loading) {
    return (
      <Paper
        sx={{
          width: 320,
          height: '100vh',
          borderRadius: 0,
          borderRight: 1,
          borderColor: 'divider',
        }}
      >
        <Box sx={{ p: 2 }}>
          <Skeleton variant="text" width="60%" height={32} />
          {[...Array(8)].map((_, index) => (
            <Box key={index} sx={{ mt: 2 }}>
              <Skeleton variant="text" width="100%" height={20} />
              <Skeleton variant="text" width="80%" height={16} />
              <Skeleton variant="text" width="40%" height={14} />
            </Box>
          ))}
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        width: 320,
        height: '100vh',
        borderRadius: 0,
        borderRight: 1,
        borderColor: 'divider',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="h6" color="text.primary" fontWeight={600}>
          Emails
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {emails.length} message{emails.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {/* Email List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {emails.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '200px',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Typography variant="body1" color="text.secondary">
              No emails yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Compose your first email to get started
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {emails.map((email) => (
              <ListItem key={email.id} disablePadding>
                <ListItemButton
                  selected={selectedEmail?.id === email.id}
                  onClick={() => onEmailSelect(email)}
                  sx={{
                    p: 2,
                    borderBottom: 1,
                    borderColor: 'divider',
                    '&.Mui-selected': {
                      bgcolor: 'primary.light',
                      color: 'primary.contrastText',
                      '&:hover': {
                        bgcolor: 'primary.main',
                      },
                    },
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{
                            color: selectedEmail?.id === email.id ? 'inherit' : 'text.primary',
                            flex: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {email.to}
                        </Typography>
                        <Chip
                          label="SENT"
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            bgcolor: selectedEmail?.id === email.id ? 'rgba(255,255,255,0.2)' : 'success.light',
                            color: selectedEmail?.id === email.id ? 'inherit' : 'success.dark',
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            color: selectedEmail?.id === email.id ? 'rgba(255,255,255,0.9)' : 'text.primary',
                            fontWeight: 500,
                            mb: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {truncateText(email.subject, 45)}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: selectedEmail?.id === email.id ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {truncateText(email.body, 60)}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: selectedEmail?.id === email.id ? 'rgba(255,255,255,0.6)' : 'text.secondary',
                            mt: 0.5,
                            display: 'block',
                          }}
                        >
                          {formatDate(email.created_at)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Paper>
  );
}
