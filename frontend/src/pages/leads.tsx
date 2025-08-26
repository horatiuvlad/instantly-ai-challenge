import React from 'react';
import { Box, Typography, Card, CardContent, useTheme } from '@mui/material';

export default function Leads() {
  const theme = useTheme();
  
  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh', 
      bgcolor: theme.palette.background.default,
      marginLeft: { xs: 0, sm: '50px', md: '60px' }, // Responsive sidebar margin
      marginTop: { xs: '60px', sm: 0 }, // Top margin for mobile horizontal sidebar
      alignItems: 'center',
      justifyContent: 'center',
      p: { xs: 2, sm: 4 },
    }}>
      <Card sx={{ 
        maxWidth: 600,
        width: '100%',
        textAlign: 'center',
      }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Typography variant="h4" sx={{ mb: 2, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
            Leads Page
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This page is for managing leads. Implementation coming soon!
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
