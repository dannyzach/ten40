import React, { useState, useEffect } from 'react';
import { Receipt } from '../types';
import JsonView from './JsonView';
import ImageModal from './ImageModal';
import UploadReceipt from './UploadReceipt';
import { FiEye } from 'react-icons/fi';

const ReceiptList: React.FC = () => {
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchReceipts();
    }, []);

    const fetchReceipts = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch('/api/receipts');
            if (!response.ok) {
                throw new Error(`Failed to fetch receipts: ${response.statusText}`);
            }
            const data = await response.json();
            if (!Array.isArray(data)) {
                throw new Error('Invalid response format from server');
            }
            setReceipts(data);
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch receipts');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleJsonExpand = (id: number) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    const handleDelete = async (id: number) => {
        try {
            await fetch(`/api/receipts/${id}`, {
                method: 'DELETE'
            });
            fetchReceipts(); // Refresh list
        } catch (error) {
            console.error('Failed to delete receipt:', error);
        }
    };

    return (
        <div className="receipt-list">
            <UploadReceipt onUploadComplete={fetchReceipts} />
            
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="loading">
                    <div className="spinner"></div>
                    Loading receipts...
                </div>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th style={{width: '20%'}}>Store</th>
                                <th style={{width: '60%'}}>Receipt Data</th>
                                <th style={{width: '20%'}}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {receipts.map(receipt => (
                                <tr key={receipt.id}>
                                    <td>{receipt.content.store_name || 'Unknown'}</td>
                                    <td 
                                        onClick={() => toggleJsonExpand(receipt.id)}
                                        className="json-cell"
                                    >
                                        <JsonView 
                                            data={receipt.content} 
                                            isExpanded={expandedRows.has(receipt.id)}
                                        />
                                    </td>
                                    <td className="actions-cell">
                                        <button 
                                            className="view-btn"
                                            onClick={() => setSelectedImage(receipt.image_path)}
                                        >
                                            <FiEye className="icon" /> View
                                        </button>
                                        <button 
                                            className="delete-btn"
                                            onClick={() => handleDelete(receipt.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedImage && (
                <ImageModal 
                    imagePath={selectedImage}
                    onClose={() => setSelectedImage(null)}
                />
            )}
        </div>
    );
};

export default ReceiptList;