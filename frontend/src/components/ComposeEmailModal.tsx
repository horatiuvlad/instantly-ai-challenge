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
} from '@mui/material';
import {
  Close as CloseIcon,
  AutoAwesome as AIIcon,
  Cancel as CancelIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { EmailService } from '../services/emailService';
import { CreateEmailData } from '../types/email';
import { colors } from '../theme';

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

  const handleInputChange = (field: keyof CreateEmailData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
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
    if (!formData.to || !formData.subject || !formData.body) {
      setError('Please fill in all required fields (To, Subject, Body)');
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
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        bgcolor: colors.surface,
        borderBottom: 1,
        borderColor: 'divider',
      }}>
        Compose Email
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
          />

          <TextField
            label="CC"
            value={formData.cc}
            onChange={handleInputChange('cc')}
            fullWidth
            placeholder="cc@example.com"
          />

          <TextField
            label="BCC"
            value={formData.bcc}
            onChange={handleInputChange('bcc')}
            fullWidth
            placeholder="bcc@example.com"
          />

          <TextField
            label="Subject *"
            value={formData.subject}
            onChange={handleInputChange('subject')}
            fullWidth
            placeholder="Email subject"
          />

          <TextField
            label="Body *"
            value={formData.body}
            onChange={handleInputChange('body')}
            fullWidth
            multiline
            rows={8}
            placeholder="Email content..."
          />

          <Collapse in={isAIMode}>
            <Box sx={{ 
              p: 2, 
              bgcolor: colors.surface, 
              borderRadius: 2,
              border: `1px solid ${colors.primary}`,
            }}>
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
              <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button
                  onClick={() => {
                    setIsAIMode(false);
                    setAIPrompt('');
                  }}
                  disabled={isGenerating}
                  startIcon={<CancelIcon />}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAIGenerate}
                  disabled={isGenerating || !aiPrompt.trim()}
                  variant="contained"
                  startIcon={isGenerating ? <CircularProgress size={16} /> : <AIIcon />}
                  sx={{ bgcolor: colors.primary }}
                >
                  {isGenerating ? 'Generating...' : 'Generate'}
                </Button>
              </Box>
            </Box>
          </Collapse>
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        px: 3, 
        pb: 3, 
        bgcolor: colors.surface,
        justifyContent: 'space-between',
      }}>
        <Button
          onClick={() => setIsAIMode(true)}
          disabled={isAIMode || isGenerating || isSending}
          startIcon={<AIIcon />}
          sx={{ 
            color: colors.primary,
            border: `1px solid ${colors.primary}`,
            '&:hover': {
              bgcolor: `${colors.primary}10`,
            }
          }}
        >
          AI ✨
        </Button>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            onClick={handleClose}
            disabled={isGenerating || isSending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendEmail}
            variant="contained"
            disabled={isGenerating || isSending || !formData.to || !formData.subject || !formData.body}
            startIcon={isSending ? <CircularProgress size={16} /> : <SendIcon />}
            sx={{ bgcolor: colors.primary }}
          >
            {isSending ? 'Sending...' : 'Send'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};
