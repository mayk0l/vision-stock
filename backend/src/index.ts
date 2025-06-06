import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import scannerRoutes from './routes/scanner.routes';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Aumentar límite para imágenes base64

const PORT = process.env.PORT || 3000;

// Routes
app.use('/api', scannerRoutes);

app.get('/', (_req, res) => {
  res.send('Vision Stock API');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});