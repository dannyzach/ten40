import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const ProfilePage: React.FC = () => {
    return (
        <Box sx={{ 
            height: '100%',
            width: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            overflow: 'auto',
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 2, sm: 3 },
        }}>
            <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom
                sx={{ 
                    fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
                    mb: { xs: 2, sm: 4 },
                    textTransform: 'uppercase'
                }}
            >
                Profile
            </Typography>
            <Paper sx={{ p: 4 }}>
                <Typography>
                    Your profile settings and preferences. This feature is coming soon.
                </Typography>
            </Paper>
        </Box>
    );
};

export default ProfilePage; 