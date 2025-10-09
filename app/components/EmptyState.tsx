import React from 'react';
import { Box, Typography } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

interface EmptyStateProps {
  message?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message = '表示できるデータはありません。' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '60vh',
        color: 'text.secondary',
      }}
    >
      <InboxIcon sx={{ fontSize: 60, mb: 2 }} />
      <Typography variant="h6">{message}</Typography>
    </Box>
  );
};

export default EmptyState;