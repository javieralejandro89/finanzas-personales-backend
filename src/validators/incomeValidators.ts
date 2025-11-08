import { body, param, query } from 'express-validator';
import { VALIDATION, PAGINATION } from '../config/constants';

/**
 * Validaciones para crear ingreso
 */
export const createIncomeValidation = [
  body('concept')
    .trim()
    .notEmpty()
    .withMessage('El concepto es requerido')
    .isLength({ min: 3, max: VALIDATION.CONCEPT_MAX_LENGTH })
    .withMessage(
      `El concepto debe tener entre 3 y ${VALIDATION.CONCEPT_MAX_LENGTH} caracteres`
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

  body('description')
    .optional()
    .trim()
    .isLength({ max: VALIDATION.DESCRIPTION_MAX_LENGTH })
    .withMessage(
      `La descripción no puede exceder ${VALIDATION.DESCRIPTION_MAX_LENGTH} caracteres`
    ),

  body('categoryId')
    .notEmpty()
    .withMessage('La categoría es requerida')
    .isInt({ min: 1 })
    .withMessage('ID de categoría inválido'),
];

/**
 * Validaciones para actualizar ingreso
 */
export const updateIncomeValidation = [
  param('id')
    .notEmpty()
    .withMessage('ID de ingreso es requerido')
    .isInt({ min: 1 })
    .withMessage('ID de ingreso inválido'),

  body('concept')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El concepto no puede estar vacío')
    .isLength({ min: 3, max: VALIDATION.CONCEPT_MAX_LENGTH })
    .withMessage(
      `El concepto debe tener entre 3 y ${VALIDATION.CONCEPT_MAX_LENGTH} caracteres`
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

  body('description')
    .optional()
    .trim()
    .isLength({ max: VALIDATION.DESCRIPTION_MAX_LENGTH })
    .withMessage(
      `La descripción no puede exceder ${VALIDATION.DESCRIPTION_MAX_LENGTH} caracteres`
    ),

  body('categoryId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de categoría inválido'),
];

/**
 * Validaciones para obtener ingreso por ID
 */
export const getIncomeByIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('ID de ingreso es requerido')
    .isInt({ min: 1 })
    .withMessage('ID de ingreso inválido'),
];

/**
 * Validaciones para eliminar ingreso
 */
export const deleteIncomeValidation = [
  param('id')
    .notEmpty()
    .withMessage('ID de ingreso es requerido')
    .isInt({ min: 1 })
    .withMessage('ID de ingreso inválido'),
];

/**
 * Validaciones para listar ingresos
 */
export const getIncomesValidation = [
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
 * Validaciones para resumen de ingresos
 */
export const getIncomeSummaryValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('startDate debe ser una fecha válida en formato ISO8601'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('endDate debe ser una fecha válida en formato ISO8601'),
];