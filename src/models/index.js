// Importar todos los modelos
const User = require('./User');
const Category = require('./Category');
const Income = require('./Income');
const Expense = require('./Expense');

// Definir asociaciones entre modelos

// Usuario tiene muchas categorías
User.hasMany(Category, {
  foreignKey: 'user_id',
  as: 'categories',
  onDelete: 'CASCADE'
});

Category.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// Usuario tiene muchos ingresos
User.hasMany(Income, {
  foreignKey: 'user_id',
  as: 'incomes',
  onDelete: 'CASCADE'
});

Income.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// Usuario tiene muchos gastos
User.hasMany(Expense, {
  foreignKey: 'user_id',
  as: 'expenses',
  onDelete: 'CASCADE'
});

Expense.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// Categoría tiene muchos ingresos
Category.hasMany(Income, {
  foreignKey: 'category_id',
  as: 'incomes',
  onDelete: 'RESTRICT' // No permitir eliminar categoría si tiene ingresos
});

Income.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category'
});

// Categoría tiene muchos gastos
Category.hasMany(Expense, {
  foreignKey: 'category_id',
  as: 'expenses',
  onDelete: 'RESTRICT' // No permitir eliminar categoría si tiene gastos
});

Expense.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category'
});

// Exportar todos los modelos
module.exports = {
  User,
  Category,
  Income,
  Expense
};