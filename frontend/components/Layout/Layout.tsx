import React, { useState } from 'react';
import { Box, IconButton, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { LeftNav } from '../LeftNav/LeftNav';
import GlobalHeader from '../GlobalHeader/GlobalHeader';

interface LayoutProps {
    children: React.ReactNode;
}

const DRAWER_WIDTH = 250;
const HEADER_HEIGHT = 64;

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <GlobalHeader>
                {isMobile && (
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                )}
            </GlobalHeader>
            
            <Box sx={{ display: 'flex', flex: 1 }}>
                <LeftNav 
                    mobileOpen={mobileOpen} 
                    onMobileClose={() => setMobileOpen(false)} 
                />
                
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
                        mt: `${HEADER_HEIGHT}px`,
                        width: '100%',
                        position: 'relative',
                        pl: { sm: `${DRAWER_WIDTH}px` },
                    }}
                >
                    {children}
                </Box>
            </Box>
        </Box>
    );
}; 