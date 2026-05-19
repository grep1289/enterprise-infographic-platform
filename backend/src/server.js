import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import generateRoute from './routes/generate.js';
import exportRoute from './routes/export.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
}

const app = express();
app.use(cors());
app.use(express.json());

app.use('/generate', generateRoute);
app.use('/export', exportRoute);

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'enterprise-infographic-platform-backend' });
});

const port = Number(process.env.PORT || 3001);
app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
