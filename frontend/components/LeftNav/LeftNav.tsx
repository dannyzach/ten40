import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    useTheme,
    useMediaQuery,
    IconButton,
    Box,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DescriptionIcon from '@mui/icons-material/Description';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';

const DRAWER_WIDTH = 250;
const HEADER_HEIGHT = 64; // Standard MUI AppBar height

interface NavItem {
    path: string;
    label: string;
    icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/documents', label: 'Documents', icon: <DescriptionIcon /> },
    { path: '/1040', label: '1040', icon: <ReceiptIcon /> },
    { path: '/profile', label: 'Profile', icon: <PersonIcon /> },
];

const StyledDrawer = styled(Drawer)(({ theme }) => ({
    width: DRAWER_WIDTH,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
        width: DRAWER_WIDTH,
        boxSizing: 'border-box',
        borderRight: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        height: `calc(100% - ${HEADER_HEIGHT}px)`,
        top: HEADER_HEIGHT,
    },
}));

interface LeftNavProps {
    mobileOpen: boolean;
    onMobileClose: () => void;
}

export const LeftNav: React.FC<LeftNavProps> = ({ mobileOpen, onMobileClose }) => {
    const router = useRouter();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const isSelected = (path: string, currentPath: string) => {
        if (path === '/documents') {
            return currentPath === path || currentPath.startsWith('/receipt/');
        }
        return currentPath === path;
    };

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {isMobile && (
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    p: 1,
                    borderBottom: 1,
                    borderColor: 'divider'
                }}>
                    <IconButton onClick={onMobileClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            )}
            <List sx={{ flex: 1, pt: isMobile ? 0 : 2 }}>
                {NAV_ITEMS.map(({ path, label, icon }) => (
                    <ListItem key={path} disablePadding>
                        <ListItemButton
                            component={Link}
                            href={path}
                            selected={isSelected(path, router.pathname)}
                            onClick={isMobile ? onMobileClose : undefined}
                            sx={{
                                py: 1.5,
                                px: 2,
                                '&.Mui-selected': {
                                    bgcolor: 'primary.light',
                                    color: 'primary.main',
                                    '&:hover': {
                                        bgcolor: 'primary.light',
                                    },
                                    '& .MuiListItemIcon-root': {
                                        color: 'primary.main',
                                    },
                                },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                                {icon}
                            </ListItemIcon>
                            <ListItemText 
                                primary={label}
                                primaryTypographyProps={{
                                    fontSize: '0.9375rem',
                                    fontWeight: 600,
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <>
            {/* Desktop permanent drawer */}
            {!isMobile && (
                <StyledDrawer
                    variant="permanent"
                    open
                >
                    {drawer}
                </StyledDrawer>
            )}

            {/* Mobile temporary drawer */}
            {isMobile && (
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={onMobileClose}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { 
                            width: DRAWER_WIDTH,
                            boxSizing: 'border-box',
                            top: HEADER_HEIGHT,
                            height: `calc(100% - ${HEADER_HEIGHT}px)`,
                        },
                    }}
                >
                    {drawer}
                </Drawer>
            )}
        </>
    );
}; 