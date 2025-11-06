const { Income, Category, sequelize } = require('../models');
const { Op } = require('sequelize');

// Obtener todos los ingresos del usuario
const getIncomes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page, limit, offset } = req.pagination;
    const { startDate, endDate, categoryId, search } = req.query;

    // Construir condiciones de búsqueda
    const whereClause = { user_id: userId };

    // Filtros de fecha
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date[Op.gte] = startDate;
      if (endDate) whereClause.date[Op.lte] = endDate;
    }

    // Filtro por categoría
    if (categoryId) {
      whereClause.category_id = categoryId;
    }

    // Filtro de búsqueda en concepto
    if (search) {
      whereClause.concept = {
        [Op.iLike]: `%${search}%`
      };
    }

    const { count, rows } = await Income.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'color', 'type']
        }
      ],
      order: [['date', 'DESC'], ['created_at', 'DESC']],
      limit,
      offset
    });

    // Calcular total de la página actual
    const pageTotal = rows.reduce((sum, income) => sum + parseFloat(income.amount), 0);

    res.json({
      success: true,
      data: rows,
      pagination: {
        current_page: page,
        per_page: limit,
        total_items: count,
        total_pages: Math.ceil(count / limit),
        page_total: pageTotal
      }
    });

  } catch (error) {
    console.error('Error obteniendo ingresos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas de ingresos (versión simplificada para SQLite)
const getIncomeStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    // Construir condiciones de fecha
    const whereClause = { user_id: userId };
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date[Op.gte] = startDate;
      if (endDate) whereClause.date[Op.lte] = endDate;
    }

    // Total de ingresos
    const totalIncomes = await Income.sum('amount', { where: whereClause });

    // Obtener todos los ingresos para procesar manualmente
    const allIncomes = await Income.findAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['name', 'color']
        }
      ]
    });

    // Procesar ingresos por categoría manualmente
    const categoryMap = {};
    let totalAmount = 0;
    const monthMap = {};

    allIncomes.forEach(income => {
      const amount = parseFloat(income.amount);
      totalAmount += amount;

      // Por categoría
      const categoryName = income.category?.name || 'Sin categoría';
      const categoryColor = income.category?.color || '#6B7280';
      
      if (!categoryMap[categoryName]) {
        categoryMap[categoryName] = {
          name: categoryName,
          color: categoryColor,
          total: 0,
          count: 0
        };
      }
      categoryMap[categoryName].total += amount;
      categoryMap[categoryName].count += 1;

      // Por mes
      const date = new Date(income.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthMap[monthKey]) {
        monthMap[monthKey] = {
          month: monthKey,
          total: 0,
          count: 0
        };
      }
      monthMap[monthKey].total += amount;
      monthMap[monthKey].count += 1;
    });

    // Convertir a arrays y ordenar
    const incomesByCategory = Object.values(categoryMap)
      .sort((a, b) => b.total - a.total);

    const incomesByMonth = Object.values(monthMap)
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 12); // Últimos 12 meses

    // Promedio mensual
    const avgMonthlyIncome = incomesByMonth.length > 0 
      ? incomesByMonth.reduce((sum, month) => sum + month.total, 0) / incomesByMonth.length
      : 0;

    res.json({
      success: true,
      data: {
        total_incomes: totalIncomes || 0,
        avg_monthly_income: avgMonthlyIncome,
        incomes_by_category: incomesByCategory,
        incomes_by_month: incomesByMonth
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas de ingresos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener un ingreso específico
const getIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const income = await Income.findOne({
      where: { id, user_id: userId },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'color', 'type']
        }
      ]
    });

    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Ingreso no encontrado'
      });
    }

    res.json({
      success: true,
      data: income
    });

  } catch (error) {
    console.error('Error obteniendo ingreso:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Crear nuevo ingreso
const createIncome = async (req, res) => {
  try {
    const userId = req.user.id;
    const { concept, amount, date, description, category_id, is_recurring, recurring_period } = req.body;

    // Verificar que la categoría existe y es del usuario
    const category = await Category.findOne({
      where: { 
        id: category_id, 
        user_id: userId, 
        type: 'income',
        is_active: true
      }
    });

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Categoría de ingreso no válida'
      });
    }

    const income = await Income.create({
      concept,
      amount,
      date: date || new Date(),
      description,
      category_id,
      is_recurring: is_recurring || false,
      recurring_period: is_recurring ? recurring_period : null,
      user_id: userId
    });

    // Obtener el ingreso creado con la categoría
    const createdIncome = await Income.findByPk(income.id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'color', 'type']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Ingreso creado exitosamente',
      data: createdIncome
    });

  } catch (error) {
    console.error('Error creando ingreso:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar ingreso
const updateIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { concept, amount, date, description, category_id, is_recurring, recurring_period } = req.body;

    // Verificar que el ingreso existe y pertenece al usuario
    const income = await Income.findOne({
      where: { id, user_id: userId }
    });

    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Ingreso no encontrado'
      });
    }

    // Si se está cambiando la categoría, verificar que es válida
    if (category_id && category_id !== income.category_id) {
      const category = await Category.findOne({
        where: { 
          id: category_id, 
          user_id: userId, 
          type: 'income',
          is_active: true
        }
      });

      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Categoría de ingreso no válida'
        });
      }
    }

    // Actualizar ingreso
    await income.update({
      concept: concept || income.concept,
      amount: amount !== undefined ? amount : income.amount,
      date: date || income.date,
      description: description !== undefined ? description : income.description,
      category_id: category_id || income.category_id,
      is_recurring: is_recurring !== undefined ? is_recurring : income.is_recurring,
      recurring_period: is_recurring !== undefined ? 
        (is_recurring ? recurring_period : null) : income.recurring_period
    });

    // Obtener el ingreso actualizado con la categoría
    const updatedIncome = await Income.findByPk(income.id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'color', 'type']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Ingreso actualizado exitosamente',
      data: updatedIncome
    });

  } catch (error) {
    console.error('Error actualizando ingreso:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar ingreso
const deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const income = await Income.findOne({
      where: { id, user_id: userId }
    });

    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Ingreso no encontrado'
      });
    }

    await income.destroy();

    res.json({
      success: true,
      message: 'Ingreso eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando ingreso:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar múltiples ingresos
const deleteMultipleIncomes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un array de IDs válido'
      });
    }

    const deletedCount = await Income.destroy({
      where: {
        id: ids,
        user_id: userId
      }
    });

    res.json({
      success: true,
      message: `${deletedCount} ingreso(s) eliminado(s) exitosamente`,
      data: { deleted_count: deletedCount }
    });

  } catch (error) {
    console.error('Error eliminando múltiples ingresos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  getIncomes,
  getIncomeStats,
  getIncome,
  createIncome,
  updateIncome,
  deleteIncome,
  deleteMultipleIncomes
};