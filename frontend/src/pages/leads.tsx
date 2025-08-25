import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { colors } from '../theme';

export default function Leads() {
  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh', 
      bgcolor: colors.white,
      marginLeft: '60px', // Account for the left sidebar
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Paper sx={{ 
        p: 4,
        borderRadius: 3,
        bgcolor: colors.whiteSmoke,
        textAlign: 'center',
      }}>
        <Typography variant="h4" sx={{ color: colors.black3, mb: 2 }}>
          Leads Page
        </Typography>
        <Typography variant="body1" sx={{ color: colors.black4 }}>
          This page is for managing leads. Implementation coming soon!
        </Typography>
      </Paper>
    </Box>
  );
}
