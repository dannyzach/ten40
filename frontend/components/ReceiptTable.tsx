import React, { useState } from 'react';
import { ArrowUpDown, Eye, FileJson, Trash2 } from "lucide-react";
import { Receipt } from '@/types';

interface ReceiptTableProps {
    receipts: Receipt[];
    onViewImage: (imagePath: string) => void;
    onViewJson: (content: any) => void;
    onDelete: (id: number) => void;
}

export const ReceiptTable: React.FC<ReceiptTableProps> = ({ 
    receipts, 
    onViewImage, 
    onViewJson, 
    onDelete 
}) => {
    const [sortConfig, setSortConfig] = useState({
        key: 'uploaded_at',
        direction: 'desc'
    });

    const handleSort = (key: string) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedReceipts = [...receipts].sort((a, b) => {
        return sortConfig.direction === 'asc'
            ? String(a[sortConfig.key]).localeCompare(String(b[sortConfig.key]))
            : String(b[sortConfig.key]).localeCompare(String(a[sortConfig.key]));
    });

    return (
        <div className="w-full bg-white p-4">
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {[
                                { label: "Receipt File Name", key: "original_filename" },
                                { label: "Upload Date", key: "uploaded_at" },
                                { label: "Actions", key: "actions" }
                            ].map((header) => (
                                <th
                                    key={header.key}
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    <button
                                        className="flex items-center space-x-1 group"
                                        onClick={() => handleSort(header.key)}
                                    >
                                        <span>{header.label}</span>
                                        <ArrowUpDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                                    </button>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedReceipts.map((receipt) => (
                            <tr
                                key={receipt.id}
                                className="hover:bg-gray-50 transition-colors"
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {receipt.original_filename}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {new Date(receipt.uploaded_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center space-x-3">
                                        <button 
                                            className="text-blue-600 hover:text-blue-800"
                                            onClick={() => onViewImage(receipt.image_path)}
                                        >
                                            <Eye className="w-5 h-5" />
                                        </button>
                                        <button 
                                            className="text-gray-600 hover:text-gray-800"
                                            onClick={() => onViewJson(receipt.content)}
                                        >
                                            <FileJson className="w-5 h-5" />
                                        </button>
                                        <button 
                                            className="text-red-600 hover:text-red-800"
                                            onClick={() => onDelete(receipt.id)}
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}; 