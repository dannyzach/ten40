import { Box, CircularProgress, type SxProps } from '@mui/material';

interface LoadingSpinnerProps {
  minHeight?: string | number;
  sx?: SxProps;
}

export default function LoadingSpinner({ minHeight = '200px', sx }: LoadingSpinnerProps) {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight={minHeight}
      sx={sx}
    >
      <CircularProgress />
    </Box>
  );
} 