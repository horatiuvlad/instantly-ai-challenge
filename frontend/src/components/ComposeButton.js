import { Fab, Tooltip } from '@mui/material';
import { Edit } from '@mui/icons-material';

export default function ComposeButton({ onClick }) {
  return (
    <Tooltip title="Compose new email" placement="left">
      <Fab
        color="primary"
        onClick={onClick}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          boxShadow: '0 4px 20px 0 rgb(0 0 0 / 0.14), 0 7px 10px -5px rgb(0 0 0 / 0.4)',
          '&:hover': {
            transform: 'scale(1.05)',
            transition: 'transform 0.2s ease-in-out',
          },
        }}
      >
        <Edit />
      </Fab>
    </Tooltip>
  );
}
