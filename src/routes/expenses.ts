import { Router } from 'express';
import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
} from '../controllers/expenseController';
import { authenticate } from '../middlewares/auth';
import { runValidations } from '../middlewares/validation';
import { asyncHandler } from '../middlewares/errorHandler';
import {
  createExpenseValidation,
  updateExpenseValidation,
  getExpenseByIdValidation,
  deleteExpenseValidation,
  getExpensesValidation,
  getExpenseSummaryValidation,
} from '../validators/expenseValidators';

const router = Router();

// Todas las rutas de gastos requieren autenticación
router.use(authenticate);

/**
 * POST /api/expenses
 * Crear nuevo gasto
 */
router.post(
  '/',
  runValidations(createExpenseValidation),
  asyncHandler(createExpense)
);

/**
 * GET /api/expenses
 * Obtener todos los gastos del usuario con paginación y filtros
 * Query params: page, limit, categoryId, paymentMethod, startDate, endDate
 */
router.get(
  '/',
  runValidations(getExpensesValidation),
  asyncHandler(getExpenses)
);

/**
 * GET /api/expenses/summary
 * Obtener resumen de gastos (total, promedio, más alto, más bajo, por método de pago)
 * Query params: startDate, endDate
 */
router.get(
  '/summary',
  runValidations(getExpenseSummaryValidation),
  asyncHandler(getExpenseSummary)
);

/**
 * GET /api/expenses/:id
 * Obtener un gasto por ID
 */
router.get(
  '/:id',
  runValidations(getExpenseByIdValidation),
  asyncHandler(getExpenseById)
);

/**
 * PATCH /api/expenses/:id
 * Actualizar gasto
 */
router.patch(
  '/:id',
  runValidations(updateExpenseValidation),
  asyncHandler(updateExpense)
);

/**
 * DELETE /api/expenses/:id
 * Eliminar gasto
 */
router.delete(
  '/:id',
  runValidations(deleteExpenseValidation),
  asyncHandler(deleteExpense)
);

export default router;