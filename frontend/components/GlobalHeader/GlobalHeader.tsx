import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    AppBar,
    Toolbar,
    Typography,
    InputBase,
    Box,
    IconButton,
    Paper,
    Popper,
    Fade,
    Button
} from '@mui/material';
import { SearchResult, SearchResultGroup } from '@/types';
import { styled } from '@mui/material/styles';

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

const ResultType = styled(Typography)(({ theme }) => ({
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(1)
}));

const ResultName = styled(Typography)({
    fontSize: '0.875rem'
});

const GlobalHeader: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const defaultSearchResults: SearchResult[] = [
    { id: '1', type: 'W-2', name: 'Google Inc', group: 'W-2 Employers' },
    { id: '2', type: '1099', name: 'Freelance Client', group: '1099 Payers' },
    { id: '3', type: 'expense', name: 'Office Supplies', group: 'Vendors' },
    { id: '4', type: 'donation', name: 'Red Cross', group: 'Charities' },
  ];

  const [searchResults, setSearchResults] = useState([...defaultSearchResults]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
        if (isMobile) setIsSearchExpanded(false);
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
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
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ 
            textDecoration: 'none',
            color: 'inherit',
            flexGrow: 0
          }}
        >
          ten40
        </Typography>

        <Box 
          sx={{ 
            position: 'relative',
            flexGrow: 1,
            mx: 2
          }}
        >
          <SearchInput
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleSearchFocus}
            onClick={handleSearchClick}
          />
          {showSearchResults && (
            <SearchResults elevation={3}>
                {Object.entries(groupedResults).map(([group, results]) => (
                    <ResultGroup key={group}>
                        <GroupHeader>{group}</GroupHeader>
                        {results.map((result) => (
                            <SearchResultItem key={result.id}>
                                <ResultType>{result.type}</ResultType>
                                <ResultName>{result.name}</ResultName>
                            </SearchResultItem>
                        ))}
                    </ResultGroup>
                ))}
            </SearchResults>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2">
            Current Tax: +$500
          </Typography>
          <IconButton
            onClick={() => {/* TODO: Implement help panel */}}
            title="Get Help"
          >
            ?
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default GlobalHeader;