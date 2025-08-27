import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  IconButton,
  CircularProgress,
  Collapse,
  Alert,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  AutoAwesome as AIIcon,
  Cancel as CancelIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { EmailService } from '../services/emailService';
import { CreateEmailData } from '../types/email';
import { validateEmail, validateEmailField } from '../utils/emailValidation';
import { theme } from '@/theme';
import zIndex from '@mui/material/styles/zIndex';

interface ComposeEmailModalProps {
  open: boolean;
  onClose: () => void;
  onEmailSent: () => void;
}

export const ComposeEmailModal: React.FC<ComposeEmailModalProps> = ({
  open,
  onClose,
  onEmailSent,
}) => {
  const theme = useTheme();
  const [formData, setFormData] = useState<CreateEmailData>({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: '',
  });

  const [isAIMode, setIsAIMode] = useState(false);
  const [aiPrompt, setAIPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  const validateFormData = (): boolean => {
    const errors: { [key: string]: string } = {};

    // Validate required 'to' field
    if (!formData.to.trim()) {
      errors.to = 'To field is required';
    } else if (!validateEmail(formData.to)) {
      errors.to = 'Please enter a valid email address';
    }

    // Validate CC field if provided
    if (formData.cc && formData.cc.trim()) {
      const ccValidation = validateEmailField(formData.cc);
      if (!ccValidation.isValid) {
        errors.cc = `Invalid email addresses: ${ccValidation.invalidEmails.join(
          ', '
        )}`;
      }
    }

    // Validate BCC field if provided
    if (formData.bcc && formData.bcc.trim()) {
      const bccValidation = validateEmailField(formData.bcc);
      if (!bccValidation.isValid) {
        errors.bcc = `Invalid email addresses: ${bccValidation.invalidEmails.join(
          ', '
        )}`;
      }
    }

    // Validate subject and body
    if (!formData.subject.trim()) {
      errors.subject = 'Subject is required';
    }

    if (!formData.body.trim()) {
      errors.body = 'Email body is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange =
    (field: keyof CreateEmailData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));

      // Clear validation error for this field when user starts typing
      if (validationErrors[field]) {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await EmailService.generateEmailWithAI(aiPrompt);
      setFormData((prev) => ({
        ...prev,
        subject: response.subject,
        body: response.body,
      }));
      setIsAIMode(false);
      setAIPrompt('');
    } catch (error) {
      setError('Failed to generate email with AI. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendEmail = async () => {
    if (!validateFormData()) {
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      await EmailService.createEmail(formData);
      onEmailSent();
      handleClose();
    } catch (error) {
      setError('Failed to send email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setFormData({
      to: '',
      cc: '',
      bcc: '',
      subject: '',
      body: '',
    });
    setIsAIMode(false);
    setAIPrompt('');
    setError(null);
    setValidationErrors({});
    onClose();
  };

  const aiOverlayStyle = {
    ...styles.aiOverlay,
    ...styles.rainbowBorder,
    ...(isGenerating && styles.rainbowBorderAnimated),
  };

  const aiOverlayWrapperStyle = {
    ...styles.aiOverlayWrapper,
    ...(isAIMode && styles.aiOverlayWrapperActive),
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      fullScreen={false} // For mobile, we'll use responsive design instead of fullscreen
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 3 },
          maxHeight: { xs: '100vh', sm: '90vh' },
          margin: { xs: 0, sm: 2 },
          maxWidth: '600px',
          position: 'relative',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: theme.palette.background.paper,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        Compose Email
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 3, overflow: 'visible' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: { xs: 1.5, sm: 2 },
          }}
        >
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <TextField
            label="To *"
            value={formData.to}
            onChange={handleInputChange('to')}
            fullWidth
            placeholder="recipient@example.com"
            error={!!validationErrors.to}
            helperText={validationErrors.to}
          />

          <TextField
            label="CC"
            value={formData.cc}
            onChange={handleInputChange('cc')}
            fullWidth
            placeholder="cc@example.com"
            error={!!validationErrors.cc}
            helperText={
              validationErrors.cc || 'Separate multiple emails with commas'
            }
          />

          <TextField
            label="BCC"
            value={formData.bcc}
            onChange={handleInputChange('bcc')}
            fullWidth
            placeholder="bcc@example.com"
            error={!!validationErrors.bcc}
            helperText={
              validationErrors.bcc || 'Separate multiple emails with commas'
            }
          />

          <TextField
            label="Subject *"
            value={formData.subject}
            onChange={handleInputChange('subject')}
            fullWidth
            placeholder="Email subject"
            error={!!validationErrors.subject}
            helperText={validationErrors.subject}
          />

          <TextField
            label="Body *"
            value={formData.body}
            onChange={handleInputChange('body')}
            fullWidth
            multiline
            rows={6}
            placeholder="Email content..."
            error={!!validationErrors.body}
            helperText={validationErrors.body}
          />
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          mx: { xs: 2, sm: 3 },
          px: 0,
          pb: { xs: 2, sm: 3 },
          bgcolor: theme.palette.background.paper,
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 },
          position: 'relative',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            width: { xs: '100%', sm: 'auto' },
            flexDirection: { xs: 'column', sm: 'row' },
            flex: 1,
            flexGrow: 1,
          }}
        >
          <Button
            onClick={() => setIsAIMode(true)}
            disabled={isAIMode || isGenerating || isSending}
            startIcon={<AIIcon />}
            variant="text"
            color="primary"
            sx={{ width: { xs: '100%', sm: 'auto' }, ...styles.rainbowBorder }}
          >
            AI
          </Button>

          <Box sx={{ flexGrow: 1 }}></Box>

          <Button
            onClick={handleClose}
            disabled={isGenerating || isSending}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendEmail}
            variant="contained"
            color="primary"
            disabled={isGenerating || isSending}
            startIcon={
              isSending ? <CircularProgress size={16} /> : <SendIcon />
            }
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            {isSending ? 'Sending...' : 'Send'}
          </Button>
        </Box>
      </DialogActions>

      <Box sx={aiOverlayWrapperStyle}>
        <Box sx={aiOverlayStyle}>
          <TextField
            value={aiPrompt}
            onChange={(e) => setAIPrompt(e.target.value)}
            fullWidth
            placeholder="e.g., Meeting request for Tuesday, Follow-up on proposal..."
            disabled={isGenerating}
            variant="outlined"
            sx={styles.aiOverlayTextField}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault(); // optional, prevents form submission
                handleAIGenerate();
              }
            }}
          />
          <Button
            onClick={() => {
              setIsAIMode(false);
              setAIPrompt('');
            }}
            disabled={isGenerating}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Cancel
          </Button>
          <Box>
            <Button
              onClick={handleAIGenerate}
              disabled={isGenerating || !aiPrompt.trim()}
              variant="contained"
              color="primary"
              startIcon={<AIIcon />}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Generate
            </Button>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
};

// Option 1:
const styles = {
  aiOverlayWrapper: {
    display: 'none',
    transition: 'all 0.5s ease-in-out',
  },
  aiOverlayWrapperActive: {
    display: 'block',
  },
  aiOverlayTextField: {
    borderColor: 'transparent',
    '& .MuiOutlinedInput-root': {
      height: '100%',
      '& fieldset': {
        border: 'none', // removes the border
        alignItems: 'center',
      },
      '&:hover fieldset': {
        border: 'none', // removes on hover
      },
      '&.Mui-focused fieldset': {
        border: 'none', // removes on focus
      },
    },
    '& .MuiInputBase-input': {
      padding: 0, // remove extra padding
    },
  },
  aiOverlay: {
    position: 'absolute',
    bottom: '22px',
    left: '22px',
    right: '22px',
    height: '54px',
    borderRadius: 0.75,
    bgcolor: theme.palette.background.default,
    display: 'flex',
    flexDirection: { xs: 'column', sm: 'row' },
    px: 1,
    py: 1,
    gap: 1,
  },
  rainbowBorder: {
    background: `
        linear-gradient(${theme.palette.background.default}, ${theme.palette.background.default}) padding-box,
        linear-gradient(45deg, #667eea, #764ba2, #f093fb, #f5576c, #4facfe, #00f2fe) border-box
      `,
    border: '2px solid transparent',
    backgroundSize: '400% 400%',
  },
  rainbowBorderAnimated: {
    background: `
        linear-gradient(${theme.palette.background.default}, ${theme.palette.background.default}) padding-box,
        linear-gradient(45deg, #667eea, #764ba2, #f093fb, #f5576c, #4facfe, #00f2fe) border-box
      `,
    border: '2px solid transparent',
    backgroundSize: '400% 400%',
    animation: 'gradient-shift 3s ease infinite',
    '@keyframes gradient-shift': {
      '0%, 100%': { backgroundPosition: '0% 50%' },
      '50%': { backgroundPosition: '100% 50%' },
    },
  },
};
