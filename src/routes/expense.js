const express = require('express');
const { body, param } = require('express-validator');
const { 
  handleValidationErrors, 
  validatePagination, 
  validateDateRange 
} = require('../middlewares/validation');
const { authenticateToken } = require('../middlewares/auth');
const {
  getExpenses,
  getExpenseStats,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  deleteMultipleExpenses
} = require('../controllers/expenseController');

const router = express.Router();

// Validaciones para crear gasto
const createExpenseValidation = [
  body('description')
    .trim()
    .notEmpty()
    .withMessage('La descripción del gasto es requerida')
    .isLength({ min: 3, max: 255 })
    .withMessage('La descripción debe tener entre 3 y 255 caracteres'),
  
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
  
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Las notas no pueden exceder 1000 caracteres'),
  
  body('payment_method')
    .optional()
    .isIn(['cash', 'card', 'transfer', 'check', 'other'])
    .withMessage('Método de pago no válido'),
  
  body('is_recurring')
    .optional()
    .isBoolean()
    .withMessage('is_recurring debe ser un valor booleano'),
  
  body('recurring_period')
    .optional()
    .isIn(['weekly', 'monthly', 'yearly'])
    .withMessage('El período recurrente debe ser weekly, monthly o yearly')
];

// Validaciones para actualizar gasto
const updateExpenseValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de gasto inválido'),
  
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('La descripción del gasto no puede estar vacía')
    .isLength({ min: 3, max: 255 })
    .withMessage('La descripción debe tener entre 3 y 255 caracteres'),
  
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
  
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Las notas no pueden exceder 1000 caracteres'),
  
  body('payment_method')
    .optional()
    .isIn(['cash', 'card', 'transfer', 'check', 'other'])
    .withMessage('Método de pago no válido'),
  
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
    .withMessage('ID de gasto inválido')
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
router.get('/', validatePagination, validateDateRange, getExpenses);
router.get('/stats', validateDateRange, getExpenseStats);
router.get('/:id', idValidation, handleValidationErrors, getExpense);
router.post('/', createExpenseValidation, handleValidationErrors, createExpense);
router.put('/:id', updateExpenseValidation, handleValidationErrors, updateExpense);
router.delete('/:id', idValidation, handleValidationErrors, deleteExpense);
router.delete('/', deleteMultipleValidation, handleValidationErrors, deleteMultipleExpenses);

module.exports = router;