import React from 'react';
import ReceiptList from '../components/ReceiptList';

const HomePage: React.FC = () => {
    return (
        <div className="container">
            <ReceiptList />
        </div>
    );
};

export default HomePage;