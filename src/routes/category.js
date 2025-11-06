const express = require('express');
const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validation');
const { authenticateToken } = require('../middlewares/auth');
const {
  getCategories,
  getCategoriesWithStats,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

const router = express.Router();

// Validaciones para crear categoría
const createCategoryValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre de la categoría es requerido')
    .isLength({ min: 1, max: 100 })
    .withMessage('El nombre debe tener entre 1 y 100 caracteres'),
  
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('El tipo debe ser income o expense'),
  
  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('El color debe ser un código hexadecimal válido (ej: #FF5733)'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres')
];

// Validaciones para actualizar categoría
const updateCategoryValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de categoría inválido'),
  
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El nombre de la categoría no puede estar vacío')
    .isLength({ min: 1, max: 100 })
    .withMessage('El nombre debe tener entre 1 y 100 caracteres'),
  
  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('El color debe ser un código hexadecimal válido (ej: #FF5733)'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres'),
  
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active debe ser un valor booleano')
];

// Validación para parámetro ID
const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de categoría inválido')
];

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// Rutas
router.get('/', getCategories);
router.get('/stats', getCategoriesWithStats);
router.get('/:id', idValidation, handleValidationErrors, getCategory);
router.post('/', createCategoryValidation, handleValidationErrors, createCategory);
router.put('/:id', updateCategoryValidation, handleValidationErrors, updateCategory);
router.delete('/:id', idValidation, handleValidationErrors, deleteCategory);

module.exports = router;