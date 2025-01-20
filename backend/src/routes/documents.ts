import express, { Request, Response, RequestHandler } from 'express';
import { deleteDocument, updateDocument, getDocument } from '../services/documentService';

const router = express.Router();

// DELETE endpoint
const deleteHandler: RequestHandler<{ id: string }> = async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid ID format' });
        return;
    }
    try {
        await deleteDocument(id);
        res.status(200).json({ message: 'Document deleted successfully' });
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ error: 'Failed to delete document' });
    }
};

// PATCH/UPDATE endpoint
const updateHandler: RequestHandler<{ id: string }> = async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid ID format' });
        return;
    }
    try {
        await updateDocument(id, req.body);
        res.status(200).json({ message: 'Document updated successfully' });
    } catch (error) {
        console.error('Error updating document:', error);
        res.status(500).json({ error: 'Failed to update document' });
    }
};

// GET endpoint
const getHandler: RequestHandler<{ id: string }> = async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid ID format' });
        return;
    }
    try {
        const document = await getDocument(id);
        res.status(200).json(document);
    } catch (error) {
        console.error('Error fetching document:', error);
        res.status(500).json({ error: 'Failed to fetch document' });
    }
};

// Bulk operations
interface BulkDeleteRequest {
    ids: number[];
}

const bulkDeleteHandler: RequestHandler<{}, any, BulkDeleteRequest> = async (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || !ids.every(id => typeof id === 'number')) {
        res.status(400).json({ error: 'Invalid ID format in bulk delete request' });
        return;
    }
    try {
        await Promise.all(ids.map(id => deleteDocument(id)));
        res.status(200).json({ message: 'Documents deleted successfully' });
    } catch (error) {
        console.error('Error in bulk delete:', error);
        res.status(500).json({ error: 'Failed to delete one or more documents' });
    }
};

// Route definitions
router.delete('/receipts/:id', deleteHandler);
router.patch('/receipts/:id/update', updateHandler);
router.get('/receipts/:id', getHandler);
router.post('/receipts/bulk-delete', bulkDeleteHandler);

export default router; 