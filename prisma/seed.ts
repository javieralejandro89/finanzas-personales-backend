import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Script de seed para crear datos de prueba
 */
async function main() {
  console.log('🌱 Iniciando seed...');

  // Limpiar datos existentes (solo en desarrollo)
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 Limpiando datos existentes...');
    await prisma.session.deleteMany();
    await prisma.expense.deleteMany();
    await prisma.income.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
  }

  // Crear usuarios de prueba
  console.log('👤 Creando usuarios de prueba...');

  const hashedPassword = await bcrypt.hash('Test123456', 10);

  const user1 = await prisma.user.create({
    data: {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      password: hashedPassword,
      currency: 'MXN',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'María García',
      email: 'maria@example.com',
      password: hashedPassword,
      currency: 'USD',
    },
  });

  console.log(`✅ Usuario creado: ${user1.email}`);
  console.log(`✅ Usuario creado: ${user2.email}`);

  // Crear categorías de ingresos para user1
  console.log('📁 Creando categorías de ingresos...');

  const incomeCategories = await prisma.category.createMany({
    data: [
      {
        name: 'Salario',
        type: 'income',
        color: '#10B981',
        userId: user1.id,
      },
      {
        name: 'Freelance',
        type: 'income',
        color: '#3B82F6',
        userId: user1.id,
      },
      {
        name: 'Inversiones',
        type: 'income',
        color: '#8B5CF6',
        userId: user1.id,
      },
    ],
  });

  console.log(`✅ ${incomeCategories.count} categorías de ingresos creadas`);

  // Crear categorías de gastos para user1
  console.log('📁 Creando categorías de gastos...');

  const expenseCategories = await prisma.category.createMany({
    data: [
      {
        name: 'Alimentación',
        type: 'expense',
        color: '#EF4444',
        userId: user1.id,
      },
      {
        name: 'Transporte',
        type: 'expense',
        color: '#F59E0B',
        userId: user1.id,
      },
      {
        name: 'Entretenimiento',
        type: 'expense',
        color: '#EC4899',
        userId: user1.id,
      },
      {
        name: 'Servicios',
        type: 'expense',
        color: '#06B6D4',
        userId: user1.id,
      },
      {
        name: 'Salud',
        type: 'expense',
        color: '#14B8A6',
        userId: user1.id,
      },
    ],
  });

  console.log(`✅ ${expenseCategories.count} categorías de gastos creadas`);

  // Obtener IDs de categorías creadas
  const salaryCategory = await prisma.category.findFirst({
    where: { name: 'Salario', userId: user1.id },
  });

  const foodCategory = await prisma.category.findFirst({
    where: { name: 'Alimentación', userId: user1.id },
  });

  const transportCategory = await prisma.category.findFirst({
    where: { name: 'Transporte', userId: user1.id },
  });

  // Crear ingresos de prueba
  if (salaryCategory) {
    console.log('💰 Creando ingresos de prueba...');

    const incomes = await prisma.income.createMany({
      data: [
        {
          concept: 'Salario mensual',
          amount: 25000,
          date: new Date('2024-11-01'),
          description: 'Salario de noviembre',
          userId: user1.id,
          categoryId: salaryCategory.id,
        },
        {
          concept: 'Salario mensual',
          amount: 25000,
          date: new Date('2024-10-01'),
          description: 'Salario de octubre',
          userId: user1.id,
          categoryId: salaryCategory.id,
        },
      ],
    });

    console.log(`✅ ${incomes.count} ingresos creados`);
  }

  // Crear gastos de prueba
  if (foodCategory && transportCategory) {
    console.log('💸 Creando gastos de prueba...');

    const expenses = await prisma.expense.createMany({
      data: [
        {
          description: 'Supermercado Walmart',
          amount: 1500,
          date: new Date('2024-11-05'),
          notes: 'Compra semanal',
          paymentMethod: 'card',
          userId: user1.id,
          categoryId: foodCategory.id,
        },
        {
          description: 'Gasolina',
          amount: 800,
          date: new Date('2024-11-06'),
          paymentMethod: 'cash',
          userId: user1.id,
          categoryId: transportCategory.id,
        },
        {
          description: 'Restaurante',
          amount: 450,
          date: new Date('2024-11-07'),
          notes: 'Comida con amigos',
          paymentMethod: 'card',
          userId: user1.id,
          categoryId: foodCategory.id,
        },
      ],
    });

    console.log(`✅ ${expenses.count} gastos creados`);
  }

  console.log('');
  console.log('🎉 Seed completado exitosamente!');
  console.log('');
  console.log('📝 Credenciales de prueba:');
  console.log('   Email: juan@example.com');
  console.log('   Password: Test123456');
  console.log('');
  console.log('   Email: maria@example.com');
  console.log('   Password: Test123456');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });