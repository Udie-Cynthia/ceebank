import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import infoRoutes from './routes/info';
import authRoutes from './routes/auth';
import txnRoutes from './routes/transactions';

const app = express();
app.use(helmet());
app.use(cors({ origin: '*'}));
app.use(express.json());

// Health checks
app.get('/api/auth/health', (_req, res) => {
  res.json({ ok: true, service: 'auth', ts: new Date().toISOString() });
});

// Mount routes
app.use('/api', infoRoutes);          // -> /api/info
app.use('/api/auth', authRoutes);     // /api/auth/...
app.use('/api/transactions', txnRoutes); // /api/transactions/...

// 404 handler (after all routers)
app.use((req, res) => {
  res.status(404).json({ error: `Not found: ${req.method} ${req.url}` });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`[ceebank-api] listening on port ${PORT}`);
});
