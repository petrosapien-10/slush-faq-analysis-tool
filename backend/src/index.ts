import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import analyzeRoutes from './routes/analyze.js';
import faqRoutes from './routes/faqs.js';
import questionsRoutes from './routes/questions.js';
import { errorHandler } from './middleware/errorHandler.js';
import { API_ROUTES } from './config/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from root directory
dotenv.config({ path: join(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(API_ROUTES.ANALYZE, analyzeRoutes);
app.use(API_ROUTES.FAQS, faqRoutes);
app.use(API_ROUTES.QUESTIONS, questionsRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});
