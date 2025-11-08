import { Router } from 'express';
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getCategoryStats,
} from '../controllers/categoryController';
import { authenticate } from '../middlewares/auth';
import { runValidations } from '../middlewares/validation';
import { asyncHandler } from '../middlewares/errorHandler';
import {
  createCategoryValidation,
  updateCategoryValidation,
  getCategoryByIdValidation,
  deleteCategoryValidation,
  getCategoriesValidation,
  getCategoryStatsValidation,
} from '../validators/categoryValidators';

const router = Router();

// Todas las rutas de categorías requieren autenticación
router.use(authenticate);

/**
 * POST /api/categories
 * Crear nueva categoría
 */
router.post(
  '/',
  runValidations(createCategoryValidation),
  asyncHandler(createCategory)
);

/**
 * GET /api/categories
 * Obtener todas las categorías del usuario
 * Query params: type (income/expense), isActive (true/false)
 */
router.get(
  '/',
  runValidations(getCategoriesValidation),
  asyncHandler(getCategories)
);

/**
 * GET /api/categories/stats
 * Obtener estadísticas de categorías
 * Query params: type, startDate, endDate
 */
router.get(
  '/stats',
  runValidations(getCategoryStatsValidation),
  asyncHandler(getCategoryStats)
);

/**
 * GET /api/categories/:id
 * Obtener una categoría por ID
 */
router.get(
  '/:id',
  runValidations(getCategoryByIdValidation),
  asyncHandler(getCategoryById)
);

/**
 * PATCH /api/categories/:id
 * Actualizar categoría
 */
router.patch(
  '/:id',
  runValidations(updateCategoryValidation),
  asyncHandler(updateCategory)
);

/**
 * DELETE /api/categories/:id
 * Eliminar o desactivar categoría
 * Si tiene transacciones asociadas, se desactiva. Si no, se elimina.
 */
router.delete(
  '/:id',
  runValidations(deleteCategoryValidation),
  asyncHandler(deleteCategory)
);

export default router;