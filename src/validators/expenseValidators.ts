import { body, param, query } from 'express-validator';
import { VALIDATION, PAGINATION } from '../config/constants';

/**
 * Validaciones para crear gasto
 */
export const createExpenseValidation = [
  body('description')
    .trim()
    .notEmpty()
    .withMessage('La descripción es requerida')
    .isLength({ min: 3, max: VALIDATION.CONCEPT_MAX_LENGTH })
    .withMessage(
      `La descripción debe tener entre 3 y ${VALIDATION.CONCEPT_MAX_LENGTH} caracteres`
    ),

  body('amount')
    .notEmpty()
    .withMessage('El monto es requerido')
    .custom((value) => {
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(numValue) || numValue <= 0) {
        throw new Error('El monto debe ser un número mayor a 0');
      }
      if (numValue > 999999999.99) {
        throw new Error('El monto es demasiado grande');
      }
      return true;
    }),

  body('date')
    .notEmpty()
    .withMessage('La fecha es requerida')
    .isISO8601()
    .withMessage('Formato de fecha inválido (use ISO8601)'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: VALIDATION.DESCRIPTION_MAX_LENGTH })
    .withMessage(
      `Las notas no pueden exceder ${VALIDATION.DESCRIPTION_MAX_LENGTH} caracteres`
    ),

  body('paymentMethod')
    .optional()
    .isIn(['cash', 'card', 'transfer', 'check', 'other'])
    .withMessage('Método de pago inválido'),

  body('categoryId')
    .notEmpty()
    .withMessage('La categoría es requerida')
    .isInt({ min: 1 })
    .withMessage('ID de categoría inválido'),
];

/**
 * Validaciones para actualizar gasto
 */
export const updateExpenseValidation = [
  param('id')
    .notEmpty()
    .withMessage('ID de gasto es requerido')
    .isInt({ min: 1 })
    .withMessage('ID de gasto inválido'),

  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('La descripción no puede estar vacía')
    .isLength({ min: 3, max: VALIDATION.CONCEPT_MAX_LENGTH })
    .withMessage(
      `La descripción debe tener entre 3 y ${VALIDATION.CONCEPT_MAX_LENGTH} caracteres`
    ),

  body('amount')
    .optional()
    .custom((value) => {
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(numValue) || numValue <= 0) {
        throw new Error('El monto debe ser un número mayor a 0');
      }
      if (numValue > 999999999.99) {
        throw new Error('El monto es demasiado grande');
      }
      return true;
    }),

  body('date')
    .optional()
    .isISO8601()
    .withMessage('Formato de fecha inválido (use ISO8601)'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: VALIDATION.DESCRIPTION_MAX_LENGTH })
    .withMessage(
      `Las notas no pueden exceder ${VALIDATION.DESCRIPTION_MAX_LENGTH} caracteres`
    ),

  body('paymentMethod')
    .optional()
    .isIn(['cash', 'card', 'transfer', 'check', 'other'])
    .withMessage('Método de pago inválido'),

  body('categoryId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de categoría inválido'),
];

/**
 * Validaciones para obtener gasto por ID
 */
export const getExpenseByIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('ID de gasto es requerido')
    .isInt({ min: 1 })
    .withMessage('ID de gasto inválido'),
];

/**
 * Validaciones para eliminar gasto
 */
export const deleteExpenseValidation = [
  param('id')
    .notEmpty()
    .withMessage('ID de gasto es requerido')
    .isInt({ min: 1 })
    .withMessage('ID de gasto inválido'),
];

/**
 * Validaciones para listar gastos
 */
export const getExpensesValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El número de página debe ser mayor a 0'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: PAGINATION.MAX_LIMIT })
    .withMessage(`El límite debe estar entre 1 y ${PAGINATION.MAX_LIMIT}`),

  query('categoryId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de categoría inválido'),

  query('paymentMethod')
    .optional()
    .isIn(['cash', 'card', 'transfer', 'check', 'other'])
    .withMessage('Método de pago inválido'),

  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('startDate debe ser una fecha válida en formato ISO8601'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('endDate debe ser una fecha válida en formato ISO8601'),
];

/**
 * Validaciones para resumen de gastos
 */
export const getExpenseSummaryValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('startDate debe ser una fecha válida en formato ISO8601'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('endDate debe ser una fecha válida en formato ISO8601'),
];