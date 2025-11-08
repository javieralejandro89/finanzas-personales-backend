import { body, param, query } from 'express-validator';
import { VALIDATION } from '../config/constants';

/**
 * Validaciones para crear categoría
 */
export const createCategoryValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2, max: VALIDATION.CATEGORY_NAME_MAX_LENGTH })
    .withMessage(
      `El nombre debe tener entre 2 y ${VALIDATION.CATEGORY_NAME_MAX_LENGTH} caracteres`
    ),

  body('type')
    .notEmpty()
    .withMessage('El tipo es requerido')
    .isIn(['income', 'expense'])
    .withMessage('El tipo debe ser "income" o "expense"'),

  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color hexadecimal inválido (ej: #FF5733)'),
];

/**
 * Validaciones para actualizar categoría
 */
export const updateCategoryValidation = [
  param('id')
    .notEmpty()
    .withMessage('ID de categoría es requerido')
    .isInt({ min: 1 })
    .withMessage('ID de categoría inválido'),

  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El nombre no puede estar vacío')
    .isLength({ min: 2, max: VALIDATION.CATEGORY_NAME_MAX_LENGTH })
    .withMessage(
      `El nombre debe tener entre 2 y ${VALIDATION.CATEGORY_NAME_MAX_LENGTH} caracteres`
    ),

  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color hexadecimal inválido (ej: #FF5733)'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser un valor booleano'),
];

/**
 * Validaciones para obtener categoría por ID
 */
export const getCategoryByIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('ID de categoría es requerido')
    .isInt({ min: 1 })
    .withMessage('ID de categoría inválido'),
];

/**
 * Validaciones para eliminar categoría
 */
export const deleteCategoryValidation = [
  param('id')
    .notEmpty()
    .withMessage('ID de categoría es requerido')
    .isInt({ min: 1 })
    .withMessage('ID de categoría inválido'),
];

/**
 * Validaciones para listar categorías
 */
export const getCategoriesValidation = [
  query('type')
    .optional()
    .isIn(['income', 'expense'])
    .withMessage('El tipo debe ser "income" o "expense"'),

  query('isActive')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('isActive debe ser "true" o "false"'),
];

/**
 * Validaciones para estadísticas de categorías
 */
export const getCategoryStatsValidation = [
  query('type')
    .optional()
    .isIn(['income', 'expense'])
    .withMessage('El tipo debe ser "income" o "expense"'),

  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('startDate debe ser una fecha válida en formato ISO8601'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('endDate debe ser una fecha válida en formato ISO8601'),
];