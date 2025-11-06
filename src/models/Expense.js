const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'La descripción del gasto es requerida'
      },
      len: {
        args: [3, 255],
        msg: 'La descripción debe tener entre 3 y 255 caracteres'
      }
    }
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      notNull: {
        msg: 'El monto es requerido'
      },
      min: {
        args: [0.01],
        msg: 'El monto debe ser mayor a 0'
      },
      max: {
        args: [9999999999999.99],
        msg: 'El monto es demasiado grande'
      }
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    validate: {
      notNull: {
        msg: 'La fecha es requerida'
      },
      isDate: {
        msg: 'Debe ser una fecha válida'
      }
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_recurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  recurring_period: {
    type: DataTypes.ENUM('weekly', 'monthly', 'yearly'),
    allowNull: true
  },
  payment_method: {
    type: DataTypes.ENUM('cash', 'card', 'transfer', 'check', 'other'),
    allowNull: true,
    defaultValue: 'cash'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id'
    }
  }
}, {
  tableName: 'expenses',
  indexes: [
    {
      fields: ['user_id', 'date']
    },
    {
      fields: ['user_id', 'category_id']
    }
  ]
});

// Método para obtener el mes y año
Expense.prototype.getMonthYear = function() {
  const date = new Date(this.date);
  return {
    month: date.getMonth() + 1,
    year: date.getFullYear(),
    monthName: date.toLocaleDateString('es', { month: 'long' })
  };
};

module.exports = Expense;