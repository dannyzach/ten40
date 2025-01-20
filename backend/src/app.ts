import express from 'express';
import documentsRouter from './routes/documents';

const app = express();

app.use('/api', documentsRouter);  // or whatever base path you're using

export default app; 