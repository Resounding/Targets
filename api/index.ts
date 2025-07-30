import 'dotenv/config';
import express from 'express';
import { registerRoutes } from '../server/routes';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize routes
await registerRoutes(app);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return app(req, res);
}