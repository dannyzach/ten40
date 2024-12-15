import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Box,
    Tooltip
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DataObjectIcon from '@mui/icons-material/DataObject';
import DeleteIcon from '@mui/icons-material/Delete';
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
    return (
        <TableContainer component={Paper}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Vendor</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Payment Method</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {receipts.map((receipt) => (
                        <TableRow key={receipt.id}>
                            <TableCell>{receipt.vendor}</TableCell>
                            <TableCell>{receipt.amount}</TableCell>
                            <TableCell>{receipt.date}</TableCell>
                            <TableCell>{receipt.payment_method}</TableCell>
                            <TableCell>{receipt.category}</TableCell>
                            <TableCell align="right">
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                    {receipt.image_path && (
                                        <Tooltip title="View Receipt">
                                            <IconButton
                                                size="small"
                                                onClick={() => onViewImage(receipt.image_path!)}
                                            >
                                                <VisibilityIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                    {receipt.content && (
                                        <Tooltip title="View Data">
                                            <IconButton
                                                size="small"
                                                onClick={() => onViewJson(receipt.content)}
                                            >
                                                <DataObjectIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                    <Tooltip title="Delete">
                                        <IconButton
                                            size="small"
                                            onClick={() => onDelete(receipt.id)}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}; 