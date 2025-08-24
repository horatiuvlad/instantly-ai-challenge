import {
  Box,
  Typography,
  Paper,
  Chip,
  Skeleton,
  Divider,
} from '@mui/material';
import { Email, Schedule, Person } from '@mui/icons-material';
import { formatDistanceToNow, format } from 'date-fns';

export default function EmailViewer({ email, loading }) {
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return {
        relative: formatDistanceToNow(date, { addSuffix: true }),
        absolute: format(date, 'PPP p'),
      };
    } catch {
      return { relative: 'Unknown', absolute: 'Unknown' };
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          flex: 1,
          p: 3,
          overflow: 'auto',
        }}
      >
        <Skeleton variant="text" width="60%" height={40} />
        <Skeleton variant="text" width="40%" height={24} sx={{ mt: 1 }} />
        <Skeleton variant="text" width="30%" height={20} sx={{ mt: 2 }} />
        <Box sx={{ mt: 3 }}>
          {[...Array(6)].map((_, index) => (
            <Skeleton key={index} variant="text" width="100%" height={20} sx={{ mt: 1 }} />
          ))}
        </Box>
      </Box>
    );
  }

  if (!email) {
    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2,
          color: 'text.secondary',
        }}
      >
        <Email sx={{ fontSize: 64, opacity: 0.3 }} />
        <Typography variant="h6" color="text.secondary">
          Select an email to view
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Choose an email from the sidebar to see its contents,<br />
          or compose a new one to get started.
        </Typography>
      </Box>
    );
  }

  const dateInfo = formatDate(email.created_at);

  return (
    <Box
      sx={{
        flex: 1,
        overflow: 'auto',
        bgcolor: 'background.default',
      }}
    >
      <Paper
        sx={{
          m: 3,
          p: 0,
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        {/* Email Header */}
        <Box
          sx={{
            p: 3,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h5" fontWeight={600} sx={{ flex: 1 }}>
              {email.subject}
            </Typography>
            <Chip
              label="SENT"
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'inherit',
                fontWeight: 600,
                ml: 2,
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person sx={{ fontSize: 18 }} />
              <Typography variant="body2">
                To: <strong>{email.to}</strong>
              </Typography>
            </Box>
            
            {email.cc && (
              <Typography variant="body2">
                CC: <strong>{email.cc}</strong>
              </Typography>
            )}
            
            {email.bcc && (
              <Typography variant="body2">
                BCC: <strong>{email.bcc}</strong>
              </Typography>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Schedule sx={{ fontSize: 18 }} />
              <Typography variant="body2" title={dateInfo.absolute}>
                {dateInfo.relative}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider />

        {/* Email Body */}
        <Box sx={{ p: 3 }}>
          <Typography
            variant="body1"
            sx={{
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
              color: 'text.primary',
            }}
          >
            {email.body || (
              <Typography
                variant="body2"
                color="text.secondary"
                fontStyle="italic"
              >
                This email has no body content.
              </Typography>
            )}
          </Typography>
        </Box>

        {/* Email Metadata */}
        <Box
          sx={{
            p: 2,
            bgcolor: 'background.default',
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Email ID: {email.id} • Created: {dateInfo.absolute}
            {email.updated_at && email.updated_at !== email.created_at && (
              <> • Updated: {formatDate(email.updated_at).absolute}</>
            )}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
