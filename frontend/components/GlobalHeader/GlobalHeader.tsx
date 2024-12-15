import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
    AppBar,
    Toolbar,
    Typography,
    InputBase,
    Box,
    IconButton,
    Paper,
    useMediaQuery,
    useTheme
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { styled } from '@mui/material/styles';
import { SearchResult } from '@/types';

const SearchInput = styled(InputBase)(({ theme }) => ({
    marginLeft: theme.spacing(1),
    flex: 1,
}));

const SearchResults = styled(Paper)(({ theme }) => ({
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1,
    marginTop: theme.spacing(1),
    maxHeight: '400px',
    overflow: 'auto'
}));

const ResultGroup = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1, 2)
}));

const GroupHeader = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    marginBottom: theme.spacing(1)
}));

const SearchResultItem = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1),
    cursor: 'pointer',
    '&:hover': {
        backgroundColor: theme.palette.action.hover
    }
}));

const TaxDisplay = styled(Typography)(({ theme }) => ({
    fontSize: '1.125rem',
    fontWeight: 600,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    color: theme.palette.primary.main,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    '& .amount': {
        fontWeight: 700,
        color: theme.palette.success.main
    }
}));

// Add children to the component props
interface GlobalHeaderProps {
    children?: React.ReactNode;
}

const GlobalHeader: React.FC<GlobalHeaderProps> = ({ children }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const defaultSearchResults: SearchResult[] = [
        { id: '1', type: 'W-2', name: 'Google Inc', group: 'W-2 Employers' },
        { id: '2', type: '1099', name: 'Freelance Client', group: '1099 Payers' },
        { id: '3', type: 'expense', name: 'Office Supplies', group: 'Vendors' },
        { id: '4', type: 'donation', name: 'Red Cross', group: 'Charities' },
    ];

    const [searchResults, setSearchResults] = useState([...defaultSearchResults]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSearchResults(false);
                if (isMobile) setIsSearchExpanded(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobile]);

    const handleSearchFocus = () => {
        setShowSearchResults(true);
        setIsSearchExpanded(true);
    };

    const handleSearchClick = () => {
        if (isMobile && !isSearchExpanded) {
            setIsSearchExpanded(true);
        }
    };

    const groupedResults = searchResults.reduce((acc, result) => ({
        ...acc,
        [result.group]: [...(acc[result.group] || []), result]
    }), {} as Record<string, SearchResult[]>);

    return (
        <AppBar 
            position="fixed" 
            color="default" 
            elevation={1}
            sx={{ 
                zIndex: theme => theme.zIndex.drawer + 1,
                borderRadius: 0,
                '& .MuiToolbar-root': {
                    borderRadius: 0,
                }
            }}
        >
            <Toolbar>
                {children}
                <Typography
                    variant="h6"
                    component={Link}
                    href="/"
                    sx={{ 
                        textDecoration: 'none',
                        color: 'inherit',
                        flexGrow: 0,
                        display: isMobile && isSearchExpanded ? 'none' : 'block'
                    }}
                >
                    ten40
                </Typography>

                <Box sx={{ 
                    flexGrow: 1, 
                    display: 'flex', 
                    justifyContent: 'center',
                    visibility: (isMobile && isSearchExpanded) ? 'hidden' : 'visible',
                    py: 1
                }}>
                    <TaxDisplay>
                        CURRENT TAX: <span className="amount">+$500</span>
                    </TaxDisplay>
                </Box>

                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    ml: 'auto'
                }}>
                    <Box 
                        ref={searchRef}
                        sx={{ 
                            position: 'relative',
                            width: isSearchExpanded ? '100%' : 'auto',
                            maxWidth: '300px',
                            transition: 'width 0.2s ease-in-out'
                        }}
                    >
                        {(!isMobile || isSearchExpanded) && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                                <SearchInput
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={handleSearchFocus}
                                    onClick={handleSearchClick}
                                    sx={{ width: isSearchExpanded ? '100%' : '200px' }}
                                />
                            </Box>
                        )}
                        {showSearchResults && (
                            <SearchResults elevation={3}>
                                {Object.entries(groupedResults).map(([group, results]) => (
                                    <ResultGroup key={group}>
                                        <GroupHeader>{group}</GroupHeader>
                                        {results.map((result) => (
                                            <SearchResultItem key={result.id}>
                                                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                                                    {result.type}
                                                </Typography>
                                                <Typography variant="body2">
                                                    {result.name}
                                                </Typography>
                                            </SearchResultItem>
                                        ))}
                                    </ResultGroup>
                                ))}
                            </SearchResults>
                        )}
                    </Box>

                    {(!isMobile || !isSearchExpanded) && (
                        <IconButton
                            onClick={() => {/* TODO: Implement help panel */}}
                            title="Get Help"
                            size="small"
                            sx={{ ml: 1 }}
                        >
                            <HelpOutlineIcon />
                        </IconButton>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default GlobalHeader;