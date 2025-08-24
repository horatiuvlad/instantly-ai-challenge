import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  IconButton,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Modal,
  Paper,
} from '@mui/material';
import {
  Close,
  Send,
  AutoAwesome,
  Psychology,
  TrendingUp,
  FollowTheSigns,
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

export default function ComposeDialog({ open, onClose, onSend }) {
  const [formData, setFormData] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: '',
  });
  const [loading, setLoading] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [assistantType, setAssistantType] = useState('');

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSend = async () => {
    if (!formData.to.trim() || !formData.subject.trim()) {
      return;
    }

    setLoading(true);
    try {
      await onSend(formData);
      setFormData({
        to: '',
        cc: '',
        bcc: '',
        subject: '',
        body: '',
      });
    } catch (error) {
      console.error('Failed to send email:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;

    setAiLoading(true);
    setAiError('');
    setAssistantType('');

    try {
      const response = await axios.post(`${API_BASE_URL}/ai/generate-email`, {
        prompt: aiPrompt,
      });

      if (response.data.success) {
        setFormData(prev => ({
          ...prev,
          subject: response.data.subject,
          body: response.data.body,
        }));
        setAssistantType(response.data.assistantType);
        setAiModalOpen(false);
        setAiPrompt('');
      } else {
        setAiError('Failed to generate email content');
      }
    } catch (error) {
      console.error('AI generation error:', error);
      setAiError('Failed to generate email content. Please try again.');
    } finally {
      setAiLoading(false);
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
    setAssistantType('');
    onClose();
  };

  const isFormValid = formData.to.trim() && formData.subject.trim();

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: 2,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Compose Email
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {assistantType && (
              <Chip
                icon={assistantType === 'sales' ? <TrendingUp /> : <FollowTheSigns />}
                label={`${assistantType === 'sales' ? 'Sales' : 'Follow-up'} Assistant`}
                size="small"
                color="secondary"
                variant="outlined"
              />
            )}
            <IconButton onClick={handleClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pb: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* To Field */}
            <TextField
              label="To"
              value={formData.to}
              onChange={handleInputChange('to')}
              fullWidth
              required
              placeholder="recipient@example.com"
            />

            {/* CC and BCC Fields */}
            <Box sx={{ display: 'flex', gap: 2 }}>
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
            </Box>

            {/* Subject Field with AI Button */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
              <TextField
                label="Subject"
                value={formData.subject}
                onChange={handleInputChange('subject')}
                fullWidth
                required
                placeholder="Email subject"
              />
              <Button
                variant="outlined"
                startIcon={<AutoAwesome />}
                onClick={() => setAiModalOpen(true)}
                sx={{
                  minWidth: 120,
                  height: 56,
                  borderColor: 'secondary.main',
                  color: 'secondary.main',
                  '&:hover': {
                    borderColor: 'secondary.dark',
                    bgcolor: 'secondary.light',
                    color: 'white',
                  },
                }}
              >
                AI ✨
              </Button>
            </Box>

            {/* Body Field */}
            <TextField
              label="Body"
              value={formData.body}
              onChange={handleInputChange('body')}
              fullWidth
              multiline
              rows={8}
              placeholder="Write your email content here..."
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Send />}
            onClick={handleSend}
            disabled={!isFormValid || loading}
          >
            {loading ? 'Sending...' : 'Send Email'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* AI Prompt Modal */}
      <Modal
        open={aiModalOpen}
        onClose={() => !aiLoading && setAiModalOpen(false)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          sx={{
            p: 4,
            maxWidth: 500,
            width: '90%',
            borderRadius: 2,
            position: 'relative',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Psychology color="secondary" />
            <Typography variant="h6" fontWeight={600}>
              AI Email Assistant
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Describe what your email should be about. Our AI will automatically choose
            the best assistant (Sales or Follow-up) and generate both subject and content.
          </Typography>

          {aiError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {aiError}
            </Alert>
          )}

          <TextField
            label="Email Description"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            fullWidth
            multiline
            rows={3}
            placeholder="e.g., 'Meeting request for Tuesday to discuss project proposal' or 'Follow up on last week's product demo'"
            disabled={aiLoading}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button
              onClick={() => setAiModalOpen(false)}
              disabled={aiLoading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleAiGenerate}
              disabled={!aiPrompt.trim() || aiLoading}
              startIcon={aiLoading ? <CircularProgress size={16} color="inherit" /> : <AutoAwesome />}
            >
              {aiLoading ? 'Generating...' : 'Generate Email'}
            </Button>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              💡 Tip: Be specific about the purpose and tone you want for better results
            </Typography>
          </Box>
        </Paper>
      </Modal>
    </>
  );
}
