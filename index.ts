import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { TuningRequest, TuningResponse } from './types';
import { calculatePerformance } from './services/physics';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: '*', // For development. Can be restricted to frontend URL in production
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Request Validator Middleware
const validateTuningRequest = (req: Request, res: Response, next: NextFunction) => {
  const { weight, horsepower, torque, drivetrain, modifications } = req.body;

  // Validation checks
  if (weight === undefined || typeof weight !== 'number' || weight < 300 || weight > 8000) {
    return res.status(400).json({ error: 'Invalid weight. Must be a number between 300 and 8000 kg.' });
  }

  if (horsepower === undefined || typeof horsepower !== 'number' || horsepower < 20 || horsepower > 4000) {
    return res.status(400).json({ error: 'Invalid horsepower. Must be a number between 20 and 4000 HP.' });
  }

  if (torque === undefined || typeof torque !== 'number' || torque < 20 || torque > 4000) {
    return res.status(400).json({ error: 'Invalid torque. Must be a number between 20 and 4000 Nm.' });
  }

  if (!drivetrain || !['FWD', 'RWD', 'AWD'].includes(drivetrain)) {
    return res.status(400).json({ error: 'Invalid drivetrain. Must be FWD, RWD, or AWD.' });
  }

  if (modifications !== undefined) {
    if (!Array.isArray(modifications)) {
      return res.status(400).json({ error: 'Modifications must be an array of strings.' });
    }
    const validMods = ['turbo', 'exhaust', 'ecu', 'intake'];
    const invalidMods = modifications.filter(mod => !validMods.includes(mod));
    if (invalidMods.length > 0) {
      return res.status(400).json({ error: `Invalid modifications selected: ${invalidMods.join(', ')}` });
    }
  }

  next();
};

// Route
app.post('/api/calculate', validateTuningRequest, (req: Request<{}, {}, TuningRequest>, res: Response<TuningResponse | { error: string }>) => {
  try {
    const results = calculatePerformance(req.body);
    return res.json(results);
  } catch (error: any) {
    console.error('Calculation error:', error);
    return res.status(500).json({ error: 'Internal calculation error. Check vehicle values.' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
