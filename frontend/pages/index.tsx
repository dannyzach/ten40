import React from 'react';
import ReceiptList from '../components/ReceiptList';

const HomePage: React.FC = () => {
    return (
        <div className="container">
            <h1>Receipt Organizer</h1>
            <ReceiptList />
        </div>
    );
};

export default HomePage;