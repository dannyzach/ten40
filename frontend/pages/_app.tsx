import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import type { AppProps } from 'next/app';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Layout } from '../components/Layout/Layout';
import { theme } from '../styles/theme';
import { CacheProvider } from '@emotion/react';
import createEmotionCache from '../lib/createEmotionCache';
import { SearchProvider } from '../contexts/SearchContext';
import { AppContextProvider } from '../contexts/AppContext';
import { AuthProvider } from '../contexts/AuthContext';
import { RouteGuard } from '../components/RouteGuard';

function MyApp({ Component, pageProps }: AppProps) {
    const clientSideEmotionCache = createEmotionCache();

    return (
        <CacheProvider value={clientSideEmotionCache}>
            <ThemeProvider theme={theme}>
                <SearchProvider>
                    <AppContextProvider>
                        <AuthProvider>
                            <RouteGuard>
                                <ErrorBoundary>
                                    <Layout>
                                        <Component {...pageProps} />
                                    </Layout>
                                </ErrorBoundary>
                            </RouteGuard>
                        </AuthProvider>
                    </AppContextProvider>
                </SearchProvider>
            </ThemeProvider>
        </CacheProvider>
    );
}

export default MyApp; 