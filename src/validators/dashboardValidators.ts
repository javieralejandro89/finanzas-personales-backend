import { query } from 'express-validator';

/**
 * Validaciones para resumen financiero
 */
export const getFinancialSummaryValidation = [
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
 * Validaciones para desglose por categorías
 */
export const getCategoryBreakdownValidation = [
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
 * Validaciones para tendencias mensuales
 */
export const getMonthlyTrendsValidation = [
  query('months')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('months debe ser un número entre 1 y 12'),
];

/**
 * Validaciones para comparación de períodos
 */
export const getComparisonValidation = [
  query('period1Start')
    .notEmpty()
    .withMessage('period1Start es requerido')
    .isISO8601()
    .withMessage('period1Start debe ser una fecha válida en formato ISO8601'),

  query('period1End')
    .notEmpty()
    .withMessage('period1End es requerido')
    .isISO8601()
    .withMessage('period1End debe ser una fecha válida en formato ISO8601'),

  query('period2Start')
    .notEmpty()
    .withMessage('period2Start es requerido')
    .isISO8601()
    .withMessage('period2Start debe ser una fecha válida en formato ISO8601'),

  query('period2End')
    .notEmpty()
    .withMessage('period2End es requerido')
    .isISO8601()
    .withMessage('period2End debe ser una fecha válida en formato ISO8601'),
];

/**
 * Validaciones para transacciones recientes
 */
export const getRecentTransactionsValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('limit debe ser un número entre 1 y 50'),
];