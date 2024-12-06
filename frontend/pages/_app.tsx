import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme } from '@mui/material';
import type { AppProps } from 'next/app';
import { ErrorBoundary } from '../components/ErrorBoundary';

const theme = createTheme({
    typography: {
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        caption: {
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'rgba(0, 0, 0, 0.6)'
        }
    },
    components: {
        MuiTableHead: {
            styleOverrides: {
                root: {
                    '& .MuiTableCell-head': {
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'rgba(0, 0, 0, 0.6)',
                        backgroundColor: 'rgba(0, 0, 0, 0.02)'
                    }
                }
            }
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    padding: '16px 24px',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
                }
            }
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    '&:nth-of-type(even)': {
                        backgroundColor: 'rgba(0, 0, 0, 0.02)'
                    },
                    '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    }
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 8,
                    fontSize: '0.875rem'
                },
                sizeSmall: {
                    padding: '4px 8px',
                    fontSize: '0.75rem'
                }
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    transition: 'all 0.2s ease-in-out',
                    borderRadius: 12
                }
            }
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 12
                }
            }
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: {
                    height: 4,
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                },
                bar: {
                    borderRadius: 2
                }
            }
        }
    },
    palette: {
        background: {
            default: '#f8f9fa'
        },
        text: {
            primary: 'rgba(0, 0, 0, 0.87)',
            secondary: 'rgba(0, 0, 0, 0.6)'
        }
    }
});

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <ErrorBoundary>
                <Component {...pageProps} />
            </ErrorBoundary>
        </ThemeProvider>
    );
}

export default MyApp; 