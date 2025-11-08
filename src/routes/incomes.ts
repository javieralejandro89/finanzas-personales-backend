import { Router } from 'express';
import {
  createIncome,
  getIncomes,
  getIncomeById,
  updateIncome,
  deleteIncome,
  getIncomeSummary,
} from '../controllers/incomeController';
import { authenticate } from '../middlewares/auth';
import { runValidations } from '../middlewares/validation';
import { asyncHandler } from '../middlewares/errorHandler';
import {
  createIncomeValidation,
  updateIncomeValidation,
  getIncomeByIdValidation,
  deleteIncomeValidation,
  getIncomesValidation,
  getIncomeSummaryValidation,
} from '../validators/incomeValidators';

const router = Router();

// Todas las rutas de ingresos requieren autenticación
router.use(authenticate);

/**
 * POST /api/incomes
 * Crear nuevo ingreso
 */
router.post(
  '/',
  runValidations(createIncomeValidation),
  asyncHandler(createIncome)
);

/**
 * GET /api/incomes
 * Obtener todos los ingresos del usuario con paginación y filtros
 * Query params: page, limit, categoryId, startDate, endDate
 */
router.get(
  '/',
  runValidations(getIncomesValidation),
  asyncHandler(getIncomes)
);

/**
 * GET /api/incomes/summary
 * Obtener resumen de ingresos (total, promedio, más alto, más bajo)
 * Query params: startDate, endDate
 */
router.get(
  '/summary',
  runValidations(getIncomeSummaryValidation),
  asyncHandler(getIncomeSummary)
);

/**
 * GET /api/incomes/:id
 * Obtener un ingreso por ID
 */
router.get(
  '/:id',
  runValidations(getIncomeByIdValidation),
  asyncHandler(getIncomeById)
);

/**
 * PATCH /api/incomes/:id
 * Actualizar ingreso
 */
router.patch(
  '/:id',
  runValidations(updateIncomeValidation),
  asyncHandler(updateIncome)
);

/**
 * DELETE /api/incomes/:id
 * Eliminar ingreso
 */
router.delete(
  '/:id',
  runValidations(deleteIncomeValidation),
  asyncHandler(deleteIncome)
);

export default router;