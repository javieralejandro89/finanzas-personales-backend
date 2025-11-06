const { Category, Income, Expense } = require('../models');
const { Op } = require('sequelize');

// Obtener todas las categorías del usuario
const getCategories = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, active } = req.query;

    // Construir condiciones de búsqueda
    const whereClause = { user_id: userId };
    
    if (type && ['income', 'expense'].includes(type)) {
      whereClause.type = type;
    }
    
    if (active !== undefined) {
      whereClause.is_active = active === 'true';
    }

    const categories = await Category.findAll({
      where: whereClause,
      order: [['name', 'ASC']],
      include: [
        {
          model: Income,
          as: 'incomes',
          attributes: [],
          required: false
        },
        {
          model: Expense,
          as: 'expenses',
          attributes: [],
          required: false
        }
      ]
    });

    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener categorías con estadísticas
const getCategoriesWithStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    // Construir condiciones de fecha
    const dateFilter = {};
    if (startDate) dateFilter[Op.gte] = startDate;
    if (endDate) dateFilter[Op.lte] = endDate;

    const categories = await Category.findAll({
      where: { user_id: userId, is_active: true },
      include: [
        {
          model: Income,
          as: 'incomes',
          attributes: ['amount'],
          where: Object.keys(dateFilter).length > 0 ? { date: dateFilter } : undefined,
          required: false
        },
        {
          model: Expense,
          as: 'expenses',
          attributes: ['amount'],
          where: Object.keys(dateFilter).length > 0 ? { date: dateFilter } : undefined,
          required: false
        }
      ],
      order: [['name', 'ASC']]
    });

    // Calcular estadísticas
    const categoriesWithStats = categories.map(category => {
      const incomeTotal = category.incomes.reduce((sum, income) => 
        sum + parseFloat(income.amount), 0
      );
      const expenseTotal = category.expenses.reduce((sum, expense) => 
        sum + parseFloat(expense.amount), 0
      );

      return {
        ...category.toJSON(),
        stats: {
          total_amount: category.type === 'income' ? incomeTotal : expenseTotal,
          transaction_count: category.type === 'income' ? 
            category.incomes.length : category.expenses.length
        }
      };
    });

    res.json({
      success: true,
      data: categoriesWithStats
    });

  } catch (error) {
    console.error('Error obteniendo categorías con estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener una categoría específica
const getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const category = await Category.findOne({
      where: { id, user_id: userId }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    res.json({
      success: true,
      data: category
    });

  } catch (error) {
    console.error('Error obteniendo categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Crear nueva categoría
const createCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, type, color, description } = req.body;

    // Verificar si ya existe una categoría con el mismo nombre y tipo
    const existingCategory = await Category.findOne({
      where: {
        name,
        type,
        user_id: userId
      }
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: `Ya existe una categoría de ${type === 'income' ? 'ingresos' : 'gastos'} con ese nombre`
      });
    }

    const category = await Category.create({
      name,
      type,
      color: color || '#6B7280',
      description,
      user_id: userId
    });

    res.status(201).json({
      success: true,
      message: 'Categoría creada exitosamente',
      data: category
    });

  } catch (error) {
    console.error('Error creando categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar categoría
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, color, description, is_active } = req.body;

    // Verificar si la categoría existe y pertenece al usuario
    const category = await Category.findOne({
      where: { id, user_id: userId }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    // Si se está cambiando el nombre, verificar que no exista otra con el mismo nombre y tipo
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({
        where: {
          name,
          type: category.type,
          user_id: userId,
          id: { [Op.ne]: id }
        }
      });

      if (existingCategory) {
        return res.status(409).json({
          success: false,
          message: `Ya existe otra categoría de ${category.type === 'income' ? 'ingresos' : 'gastos'} con ese nombre`
        });
      }
    }

    // Actualizar categoría
    await category.update({
      name: name || category.name,
      color: color || category.color,
      description: description !== undefined ? description : category.description,
      is_active: is_active !== undefined ? is_active : category.is_active
    });

    res.json({
      success: true,
      message: 'Categoría actualizada exitosamente',
      data: category
    });

  } catch (error) {
    console.error('Error actualizando categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar categoría
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar si la categoría existe y pertenece al usuario
    const category = await Category.findOne({
      where: { id, user_id: userId }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    // Verificar si la categoría tiene transacciones asociadas
    const hasIncomes = await Income.count({
      where: { category_id: id }
    });

    const hasExpenses = await Expense.count({
      where: { category_id: id }
    });

    if (hasIncomes > 0 || hasExpenses > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar la categoría porque tiene transacciones asociadas. Desactívala en su lugar.'
      });
    }

    // Eliminar categoría
    await category.destroy();

    res.json({
      success: true,
      message: 'Categoría eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  getCategories,
  getCategoriesWithStats,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
};