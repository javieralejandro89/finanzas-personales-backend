import { Router } from 'express';
import {
  getFinancialSummary,
  getCategoryBreakdown,
  getMonthlyTrends,
  getComparison,
  getRecentTransactions,
} from '../controllers/dashboardController';
import { authenticate } from '../middlewares/auth';
import { runValidations } from '../middlewares/validation';
import { asyncHandler } from '../middlewares/errorHandler';
import {
  getFinancialSummaryValidation,
  getCategoryBreakdownValidation,
  getMonthlyTrendsValidation,
  getComparisonValidation,
  getRecentTransactionsValidation,
} from '../validators/dashboardValidators';

const router = Router();

// Todas las rutas de dashboard requieren autenticación
router.use(authenticate);

/**
 * GET /api/dashboard/summary
 * Obtener resumen financiero general
 * Query params: startDate, endDate (opcional, por defecto mes actual)
 */
router.get(
  '/summary',
  runValidations(getFinancialSummaryValidation),
  asyncHandler(getFinancialSummary)
);

/**
 * GET /api/dashboard/categories
 * Obtener desglose por categorías (Top 5 de ingresos y gastos)
 * Query params: startDate, endDate (opcional, por defecto mes actual)
 */
router.get(
  '/categories',
  runValidations(getCategoryBreakdownValidation),
  asyncHandler(getCategoryBreakdown)
);

/**
 * GET /api/dashboard/trends
 * Obtener tendencias mensuales
 * Query params: months (opcional, por defecto 6, máximo 12)
 */
router.get(
  '/trends',
  runValidations(getMonthlyTrendsValidation),
  asyncHandler(getMonthlyTrends)
);

/**
 * GET /api/dashboard/comparison
 * Comparar dos períodos
 * Query params: period1Start, period1End, period2Start, period2End (todos requeridos)
 */
router.get(
  '/comparison',
  runValidations(getComparisonValidation),
  asyncHandler(getComparison)
);

/**
 * GET /api/dashboard/recent
 * Obtener transacciones recientes
 * Query params: limit (opcional, por defecto 10, máximo 50)
 */
router.get(
  '/recent',
  runValidations(getRecentTransactionsValidation),
  asyncHandler(getRecentTransactions)
);

export default router;