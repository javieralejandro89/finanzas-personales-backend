import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { CONFIG } from './config/constants';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import authRoutes from './routes/auth';
import categoryRoutes from './routes/categories';
import incomeRoutes from './routes/incomes';
import expenseRoutes from './routes/expenses';
import dashboardRoutes from './routes/dashboard';

/**
 * Crear y configurar la aplicación Express
 */
export const createApp = (): Application => {
  const app = express();

  // Middlewares básicos
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // CORS
  app.use(
    cors({
      origin: CONFIG.FRONTEND_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Logger HTTP
  if (CONFIG.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // Health check
  app.get('/health', (_, res) => {
    res.json({
      success: true,
      message: 'API funcionando correctamente',
      timestamp: new Date().toISOString(),
      environment: CONFIG.NODE_ENV,
    });
  });

  // Rutas API
  // TODO: Importar y usar rutas
  app.use('/api/auth', authRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/incomes', incomeRoutes);
  app.use('/api/expenses', expenseRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  // Manejadores de error
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};