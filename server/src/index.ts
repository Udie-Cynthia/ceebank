import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import authRoutes from './routes/auth';
import txnRoutes from './routes/transactions';
import debugRoutes from './routes/debug';
import infoRoutes from './routes/info';

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

// Info routes
app.use('/api', infoRoutes);

// Auth + Account routes
app.use('/api/auth', authRoutes);

// Transactions
app.use('/api/transactions', txnRoutes);

// Debug (optional)
app.use('/api/debug', debugRoutes);

// Fallback 404
app.use((req, res) => {
  res.status(404).json({ error: `Not found: ${req.method} ${req.originalUrl}` });
});

const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => {
  console.log(`[ceebank-api] listening on port ${PORT}`);
});

