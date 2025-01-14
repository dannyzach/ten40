import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

export const RouteGuard: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    
    useEffect(() => {
        // Check if we're on a protected route
        if (!isAuthenticated && router.pathname !== '/login' && router.pathname !== '/signup') {
            router.push('/login');
        }
    }, [isAuthenticated, router]);
    
    return <>{children}</>;
}; 