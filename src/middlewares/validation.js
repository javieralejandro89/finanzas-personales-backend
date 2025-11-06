const { validationResult } = require('express-validator');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array().map(error => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

// Middleware para validar que el recurso pertenece al usuario autenticado
const validateOwnership = (model) => {
  return async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const resource = await model.findOne({
        where: { id, user_id: userId }
      });
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Recurso no encontrado o no tienes permisos para acceder'
        });
      }
      
      req.resource = resource;
      next();
      
    } catch (error) {
      console.error('Error validando ownership:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
};

// Middleware para validar parámetros de paginación
const validatePagination = (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  
  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  
  if (isNaN(pageNumber) || pageNumber < 1) {
    return res.status(400).json({
      success: false,
      message: 'El número de página debe ser un entero mayor a 0'
    });
  }
  
  if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 100) {
    return res.status(400).json({
      success: false,
      message: 'El límite debe ser un entero entre 1 y 100'
    });
  }
  
  req.pagination = {
    page: pageNumber,
    limit: limitNumber,
    offset: (pageNumber - 1) * limitNumber
  };
  
  next();
};

// Middleware para validar fechas
const validateDateRange = (req, res, next) => {
  const { startDate, endDate } = req.query;
  
  if (startDate && isNaN(Date.parse(startDate))) {
    return res.status(400).json({
      success: false,
      message: 'Fecha de inicio inválida'
    });
  }
  
  if (endDate && isNaN(Date.parse(endDate))) {
    return res.status(400).json({
      success: false,
      message: 'Fecha de fin inválida'
    });
  }
  
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    return res.status(400).json({
      success: false,
      message: 'La fecha de inicio no puede ser mayor a la fecha de fin'
    });
  }
  
  next();
};

module.exports = {
  handleValidationErrors,
  validateOwnership,
  validatePagination,
  validateDateRange
};