const { Expense, Category, sequelize } = require('../models');
const { Op } = require('sequelize');

// Obtener todos los gastos del usuario
const getExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page, limit, offset } = req.pagination;
    const { startDate, endDate, categoryId, search, paymentMethod } = req.query;

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

    // Filtro de búsqueda en descripción
    if (search) {
      whereClause.description = {
        [Op.iLike]: `%${search}%`
      };
    }

    // Filtro por método de pago
    if (paymentMethod) {
      whereClause.payment_method = paymentMethod;
    }

    const { count, rows } = await Expense.findAndCountAll({
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
    const pageTotal = rows.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

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
    console.error('Error obteniendo gastos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas de gastos (versión simplificada para SQLite)
const getExpenseStats = async (req, res) => {
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

    // Total de gastos
    const totalExpenses = await Expense.sum('amount', { where: whereClause });

    // Obtener todos los gastos para procesar manualmente
    const allExpenses = await Expense.findAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['name', 'color']
        }
      ],
      order: [['amount', 'DESC']]
    });

    // Procesar gastos manualmente
    const categoryMap = {};
    const paymentMethodMap = {};
    const monthMap = {};

    allExpenses.forEach(expense => {
      const amount = parseFloat(expense.amount);

      // Por categoría
      const categoryName = expense.category?.name || 'Sin categoría';
      const categoryColor = expense.category?.color || '#6B7280';
      
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

      // Por método de pago
      const paymentMethod = expense.payment_method || 'other';
      if (!paymentMethodMap[paymentMethod]) {
        paymentMethodMap[paymentMethod] = {
          payment_method: paymentMethod,
          total: 0,
          count: 0
        };
      }
      paymentMethodMap[paymentMethod].total += amount;
      paymentMethodMap[paymentMethod].count += 1;

      // Por mes
      const date = new Date(expense.date);
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
    const expensesByCategory = Object.values(categoryMap)
      .sort((a, b) => b.total - a.total);

    const expensesByPaymentMethod = Object.values(paymentMethodMap)
      .sort((a, b) => b.total - a.total);

    const expensesByMonth = Object.values(monthMap)
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 12); // Últimos 12 meses

    // Promedio mensual
    const avgMonthlyExpense = expensesByMonth.length > 0 
      ? expensesByMonth.reduce((sum, month) => sum + month.total, 0) / expensesByMonth.length
      : 0;

    // Top 5 gastos más altos del período
    const topExpenses = allExpenses.slice(0, 5).map(expense => ({
      id: expense.id,
      description: expense.description,
      amount: parseFloat(expense.amount),
      date: expense.date,
      category: expense.category
    }));

    res.json({
      success: true,
      data: {
        total_expenses: totalExpenses || 0,
        avg_monthly_expense: avgMonthlyExpense,
        expenses_by_category: expensesByCategory,
        expenses_by_payment_method: expensesByPaymentMethod,
        expenses_by_month: expensesByMonth,
        top_expenses: topExpenses
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas de gastos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener un gasto específico
const getExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const expense = await Expense.findOne({
      where: { id, user_id: userId },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'color', 'type']
        }
      ]
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Gasto no encontrado'
      });
    }

    res.json({
      success: true,
      data: expense
    });

  } catch (error) {
    console.error('Error obteniendo gasto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Crear nuevo gasto
const createExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      description, 
      amount, 
      date, 
      notes, 
      category_id, 
      is_recurring, 
      recurring_period,
      payment_method 
    } = req.body;

    // Verificar que la categoría existe y es del usuario
    const category = await Category.findOne({
      where: { 
        id: category_id, 
        user_id: userId, 
        type: 'expense',
        is_active: true
      }
    });

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Categoría de gasto no válida'
      });
    }

    const expense = await Expense.create({
      description,
      amount,
      date: date || new Date(),
      notes,
      category_id,
      is_recurring: is_recurring || false,
      recurring_period: is_recurring ? recurring_period : null,
      payment_method: payment_method || 'cash',
      user_id: userId
    });

    // Obtener el gasto creado con la categoría
    const createdExpense = await Expense.findByPk(expense.id, {
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
      message: 'Gasto creado exitosamente',
      data: createdExpense
    });

  } catch (error) {
    console.error('Error creando gasto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar gasto
const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { 
      description, 
      amount, 
      date, 
      notes, 
      category_id, 
      is_recurring, 
      recurring_period,
      payment_method 
    } = req.body;

    // Verificar que el gasto existe y pertenece al usuario
    const expense = await Expense.findOne({
      where: { id, user_id: userId }
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Gasto no encontrado'
      });
    }

    // Si se está cambiando la categoría, verificar que es válida
    if (category_id && category_id !== expense.category_id) {
      const category = await Category.findOne({
        where: { 
          id: category_id, 
          user_id: userId, 
          type: 'expense',
          is_active: true
        }
      });

      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Categoría de gasto no válida'
        });
      }
    }

    // Actualizar gasto
    await expense.update({
      description: description || expense.description,
      amount: amount !== undefined ? amount : expense.amount,
      date: date || expense.date,
      notes: notes !== undefined ? notes : expense.notes,
      category_id: category_id || expense.category_id,
      is_recurring: is_recurring !== undefined ? is_recurring : expense.is_recurring,
      recurring_period: is_recurring !== undefined ? 
        (is_recurring ? recurring_period : null) : expense.recurring_period,
      payment_method: payment_method || expense.payment_method
    });

    // Obtener el gasto actualizado con la categoría
    const updatedExpense = await Expense.findByPk(expense.id, {
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
      message: 'Gasto actualizado exitosamente',
      data: updatedExpense
    });

  } catch (error) {
    console.error('Error actualizando gasto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar gasto
const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const expense = await Expense.findOne({
      where: { id, user_id: userId }
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Gasto no encontrado'
      });
    }

    await expense.destroy();

    res.json({
      success: true,
      message: 'Gasto eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando gasto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar múltiples gastos
const deleteMultipleExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un array de IDs válido'
      });
    }

    const deletedCount = await Expense.destroy({
      where: {
        id: ids,
        user_id: userId
      }
    });

    res.json({
      success: true,
      message: `${deletedCount} gasto(s) eliminado(s) exitosamente`,
      data: { deleted_count: deletedCount }
    });

  } catch (error) {
    console.error('Error eliminando múltiples gastos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  getExpenses,
  getExpenseStats,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  deleteMultipleExpenses
};