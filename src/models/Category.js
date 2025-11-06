const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El nombre de la categoría es requerido'
      },
      len: {
        args: [1, 100],
        msg: 'El nombre debe tener entre 1 y 100 caracteres'
      }
    }
  },
  type: {
    type: DataTypes.ENUM('income', 'expense'),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El tipo de categoría es requerido'
      },
      isIn: {
        args: [['income', 'expense']],
        msg: 'El tipo debe ser income o expense'
      }
    }
  },
  color: {
    type: DataTypes.STRING(7),
    allowNull: true,
    defaultValue: '#6B7280',
    validate: {
      is: {
        args: /^#[0-9A-Fa-f]{6}$/,
        msg: 'El color debe ser un código hexadecimal válido (ej: #FF5733)'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'categories',
  indexes: [
    {
      unique: true,
      fields: ['name', 'type', 'user_id'],
      name: 'unique_category_per_user_type'
    }
  ]
});

module.exports = Category;