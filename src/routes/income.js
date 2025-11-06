const express = require('express');
const { body, param } = require('express-validator');
const { 
  handleValidationErrors, 
  validatePagination, 
  validateDateRange 
} = require('../middlewares/validation');
const { authenticateToken } = require('../middlewares/auth');
const {
  getIncomes,
  getIncomeStats,
  getIncome,
  createIncome,
  updateIncome,
  deleteIncome,
  deleteMultipleIncomes
} = require('../controllers/incomeController');

const router = express.Router();

// Validaciones para crear ingreso
const createIncomeValidation = [
  body('concept')
    .trim()
    .notEmpty()
    .withMessage('El concepto del ingreso es requerido')
    .isLength({ min: 3, max: 255 })
    .withMessage('El concepto debe tener entre 3 y 255 caracteres'),
  
  body('amount')
    .isFloat({ min: 0.01, max: 9999999999999.99 })
    .withMessage('El monto debe ser un número mayor a 0'),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('La fecha debe tener formato válido (YYYY-MM-DD)'),
  
  body('category_id')
    .isInt({ min: 1 })
    .withMessage('ID de categoría inválido'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder 1000 caracteres'),
  
  body('is_recurring')
    .optional()
    .isBoolean()
    .withMessage('is_recurring debe ser un valor booleano'),
  
  body('recurring_period')
    .optional()
    .isIn(['weekly', 'monthly', 'yearly'])
    .withMessage('El período recurrente debe ser weekly, monthly o yearly')
];

// Validaciones para actualizar ingreso
const updateIncomeValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de ingreso inválido'),
  
  body('concept')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El concepto del ingreso no puede estar vacío')
    .isLength({ min: 3, max: 255 })
    .withMessage('El concepto debe tener entre 3 y 255 caracteres'),
  
  body('amount')
    .optional()
    .isFloat({ min: 0.01, max: 9999999999999.99 })
    .withMessage('El monto debe ser un número mayor a 0'),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('La fecha debe tener formato válido (YYYY-MM-DD)'),
  
  body('category_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de categoría inválido'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder 1000 caracteres'),
  
  body('is_recurring')
    .optional()
    .isBoolean()
    .withMessage('is_recurring debe ser un valor booleano'),
  
  body('recurring_period')
    .optional()
    .isIn(['weekly', 'monthly', 'yearly'])
    .withMessage('El período recurrente debe ser weekly, monthly o yearly')
];

// Validación para parámetro ID
const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de ingreso inválido')
];

// Validación para eliminación múltiple
const deleteMultipleValidation = [
  body('ids')
    .isArray({ min: 1 })
    .withMessage('Se requiere un array de IDs')
    .custom((ids) => {
      if (!ids.every(id => Number.isInteger(id) && id > 0)) {
        throw new Error('Todos los IDs deben ser números enteros positivos');
      }
      return true;
    })
];

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// Rutas
router.get('/', validatePagination, validateDateRange, getIncomes);
router.get('/stats', validateDateRange, getIncomeStats);
router.get('/:id', idValidation, handleValidationErrors, getIncome);
router.post('/', createIncomeValidation, handleValidationErrors, createIncome);
router.put('/:id', updateIncomeValidation, handleValidationErrors, updateIncome);
router.delete('/:id', idValidation, handleValidationErrors, deleteIncome);
router.delete('/', deleteMultipleValidation, handleValidationErrors, deleteMultipleIncomes);

module.exports = router;