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
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const validateFormData = (): boolean => {
    const errors: {[key: string]: string} = {};
    
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
        errors.cc = `Invalid email addresses: ${ccValidation.invalidEmails.join(', ')}`;
      }
    }
    
    // Validate BCC field if provided
    if (formData.bcc && formData.bcc.trim()) {
      const bccValidation = validateEmailField(formData.bcc);
      if (!bccValidation.isValid) {
        errors.bcc = `Invalid email addresses: ${bccValidation.invalidEmails.join(', ')}`;
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

  const handleInputChange = (field: keyof CreateEmailData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
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
      setFormData(prev => ({
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
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        bgcolor: theme.palette.background.paper,
        borderBottom: 1,
        borderColor: 'divider',
      }}>
        Compose Email
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
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
            helperText={validationErrors.cc || "Separate multiple emails with commas"}
          />

          <TextField
            label="BCC"
            value={formData.bcc}
            onChange={handleInputChange('bcc')}
            fullWidth
            placeholder="bcc@example.com"
            error={!!validationErrors.bcc}
            helperText={validationErrors.bcc || "Separate multiple emails with commas"}
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

          <Collapse in={isAIMode}>
            <Card sx={{ 
              border: `1px solid ${theme.palette.primary.main}`,
              bgcolor: theme.palette.background.paper,
            }}>
              <CardContent>
                <TextField
                  label="Describe what the email should be about"
                  value={aiPrompt}
                  onChange={(e) => setAIPrompt(e.target.value)}
                  fullWidth
                  placeholder="e.g., Meeting request for Tuesday, Follow-up on proposal..."
                  multiline
                  rows={2}
                  disabled={isGenerating}
                />
                <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end', flexDirection: { xs: 'column', sm: 'row' } }}>
                  <Button
                    onClick={() => {
                      setIsAIMode(false);
                      setAIPrompt('');
                    }}
                    disabled={isGenerating}
                    startIcon={<CancelIcon />}
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAIGenerate}
                    disabled={isGenerating || !aiPrompt.trim()}
                    variant="contained"
                    color="primary"
                    startIcon={isGenerating ? <CircularProgress size={16} /> : <AIIcon />}
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                  >
                    {isGenerating ? 'Generating...' : 'Generate'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Collapse>
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        px: { xs: 2, sm: 3 }, 
        pb: { xs: 2, sm: 3 }, 
        bgcolor: theme.palette.background.paper,
        justifyContent: 'space-between',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 },
      }}>
        <Button
          onClick={() => setIsAIMode(true)}
          disabled={isAIMode || isGenerating || isSending}
          startIcon={<AIIcon />}
          variant="outlined"
          color="primary"
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          AI ✨
        </Button>

        <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' }, flexDirection: { xs: 'column', sm: 'row' } }}>
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
            startIcon={isSending ? <CircularProgress size={16} /> : <SendIcon />}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            {isSending ? 'Sending...' : 'Send'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};
