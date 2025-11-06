// Script para poblar la base de datos con datos de ejemplo
// Ejecutar con: node seed-data.js

require('dotenv').config();
const { sequelize } = require('./src/config/database');
const { User, Category, Income, Expense } = require('./src/models');

const seedData = async () => {
  try {
    console.log('🌱 Iniciando población de datos...');

    // Sincronizar base de datos
    await sequelize.sync({ force: true }); // ⚠️ Esto borra todos los datos
    console.log('✅ Base de datos sincronizada');

    // Crear usuario de ejemplo
    const user = await User.create({
      name: 'Ana García',
      email: 'ana@example.com',
      password: 'Password123',
      currency: 'USD'
    });

    console.log('✅ Usuario creado:', user.email);

    // Crear categorías de ingresos
    const incomeCategories = await Category.bulkCreate([
      { name: 'Salario Principal', type: 'income', color: '#10B981', user_id: user.id },
      { name: 'Freelance', type: 'income', color: '#3B82F6', user_id: user.id },
      { name: 'Inversiones', type: 'income', color: '#8B5CF6', user_id: user.id },
      { name: 'Bonos', type: 'income', color: '#F59E0B', user_id: user.id },
      { name: 'Ventas', type: 'income', color: '#06B6D4', user_id: user.id }
    ]);

    // Crear categorías de gastos
    const expenseCategories = await Category.bulkCreate([
      { name: 'Alimentación', type: 'expense', color: '#EF4444', user_id: user.id },
      { name: 'Transporte', type: 'expense', color: '#F97316', user_id: user.id },
      { name: 'Vivienda', type: 'expense', color: '#84CC16', user_id: user.id },
      { name: 'Salud', type: 'expense', color: '#06B6D4', user_id: user.id },
      { name: 'Entretenimiento', type: 'expense', color: '#8B5CF6', user_id: user.id },
      { name: 'Educación', type: 'expense', color: '#EC4899', user_id: user.id },
      { name: 'Servicios', type: 'expense', color: '#6B7280', user_id: user.id },
      { name: 'Compras', type: 'expense', color: '#374151', user_id: user.id }
    ]);

    console.log('✅ Categorías creadas:', incomeCategories.length + expenseCategories.length);

    // Crear ingresos de ejemplo (últimos 6 meses)
    const incomes = [];
    const today = new Date();
    
    for (let month = 0; month < 6; month++) {
      const date = new Date(today.getFullYear(), today.getMonth() - month, 1);
      
      // Salario mensual
      incomes.push({
        concept: `Salario ${date.toLocaleDateString('es', { month: 'long', year: 'numeric' })}`,
        amount: 4500 + Math.random() * 500, // 4500-5000
        date: date.toISOString().split('T')[0],
        description: 'Salario mensual principal',
        user_id: user.id,
        category_id: incomeCategories[0].id
      });

      // Freelance (aleatorio)
      if (Math.random() > 0.3) {
        incomes.push({
          concept: `Proyecto freelance - ${date.toLocaleDateString('es', { month: 'short' })}`,
          amount: 800 + Math.random() * 1200, // 800-2000
          date: new Date(date.getTime() + Math.random() * 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: 'Ingresos por trabajo independiente',
          user_id: user.id,
          category_id: incomeCategories[1].id
        });
      }

      // Inversiones (algunos meses)
      if (Math.random() > 0.5) {
        incomes.push({
          concept: `Dividendos e intereses`,
          amount: 200 + Math.random() * 300, // 200-500
          date: new Date(date.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: 'Rendimientos de inversiones',
          user_id: user.id,
          category_id: incomeCategories[2].id
        });
      }
    }

    await Income.bulkCreate(incomes);
    console.log('✅ Ingresos creados:', incomes.length);

    // Crear gastos de ejemplo
    const expenses = [];
    const paymentMethods = ['cash', 'card', 'transfer', 'check'];

    for (let month = 0; month < 6; month++) {
      const date = new Date(today.getFullYear(), today.getMonth() - month, 1);
      
      // Gastos fijos mensuales
      const fixedExpenses = [
        { description: 'Renta del apartamento', amount: 1200, category_id: expenseCategories[2].id },
        { description: 'Seguro médico', amount: 150, category_id: expenseCategories[3].id },
        { description: 'Internet y cable', amount: 80, category_id: expenseCategories[6].id },
        { description: 'Electricidad', amount: 90 + Math.random() * 40, category_id: expenseCategories[6].id },
        { description: 'Gas', amount: 45 + Math.random() * 20, category_id: expenseCategories[6].id }
      ];

      for (const expense of fixedExpenses) {
        expenses.push({
          description: expense.description,
          amount: expense.amount,
          date: new Date(date.getTime() + Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          payment_method: Math.random() > 0.7 ? 'cash' : 'transfer',
          user_id: user.id,
          category_id: expense.category_id
        });
      }

      // Gastos variables
      const variableExpenses = [
        { description: 'Supermercado', amount: () => 60 + Math.random() * 80, category_id: expenseCategories[0].id, frequency: 8 },
        { description: 'Gasolina', amount: () => 40 + Math.random() * 30, category_id: expenseCategories[1].id, frequency: 4 },
        { description: 'Restaurantes', amount: () => 25 + Math.random() * 50, category_id: expenseCategories[0].id, frequency: 6 },
        { description: 'Farmacia', amount: () => 15 + Math.random() * 35, category_id: expenseCategories[3].id, frequency: 2 },
        { description: 'Entretenimiento', amount: () => 30 + Math.random() * 70, category_id: expenseCategories[4].id, frequency: 4 }
      ];

      for (const expenseType of variableExpenses) {
        for (let i = 0; i < expenseType.frequency; i++) {
          if (Math.random() > 0.2) { // 80% probabilidad de ocurrir
            expenses.push({
              description: expenseType.description + ` #${i + 1}`,
              amount: expenseType.amount(),
              date: new Date(date.getTime() + Math.random() * 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              payment_method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
              user_id: user.id,
              category_id: expenseType.category_id
            });
          }
        }
      }
    }

    await Expense.bulkCreate(expenses);
    console.log('✅ Gastos creados:', expenses.length);

    // Mostrar resumen
    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const balance = totalIncome - totalExpenses;

    console.log('\n📊 RESUMEN DE DATOS CREADOS:');
    console.log(`💰 Total ingresos: ${totalIncome.toFixed(2)}`);
    console.log(`💸 Total gastos: ${totalExpenses.toFixed(2)}`);
    console.log(`📈 Balance: ${balance.toFixed(2)}`);
    console.log(`👤 Usuario: ${user.name} (${user.email})`);
    console.log(`🏷️ Categorías: ${incomeCategories.length} ingresos, ${expenseCategories.length} gastos`);

    console.log('\n🎉 Datos de ejemplo creados exitosamente!');
    console.log('📋 Credenciales de prueba:');
    console.log('   Email: ana@example.com');
    console.log('   Password: Password123');

  } catch (error) {
    console.error('❌ Error poblando datos:', error);
  } finally {
    await sequelize.close();
  }
};

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  seedData();
}

module.exports = seedData;