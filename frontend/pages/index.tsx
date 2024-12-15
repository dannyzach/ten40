import React from 'react';
import { Container } from '@mui/material';
import ReceiptList from '../components/ReceiptList';

const HomePage: React.FC = () => {
    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <ReceiptList />
        </Container>
    );
};

export default HomePage;