import express from 'express';
import dotenv from 'dotenv';
import apiRouter from './api/index.js';
import cors from 'cors';
import passport from './middleware/auth.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(passport.initialize()); 

app.use('/api', apiRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend attivo su http://localhost:${PORT}`);
});
