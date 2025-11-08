import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { prisma } from '../config/prisma';
import { createMoney, moneyToNumber, subtractMoney, moneyToDecimal } from '../utils/money';
import { createUnauthorizedError } from '../middlewares/errorHandler';
import { HTTP_STATUS } from '../config/constants';
import { getStartOfMonth, getEndOfMonth, getMonthName } from '../utils/validators';

/**
 * Obtener resumen financiero general
 */
export const getFinancialSummary = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw createUnauthorizedError();
  }

  const { startDate, endDate } = req.query;

  // Construir filtro de fechas
  const dateFilter: {
    gte?: Date;
    lte?: Date;
  } = {};

  if (startDate) {
    dateFilter.gte = new Date(startDate as string);
  } else {
    // Por defecto, inicio del mes actual
    dateFilter.gte = getStartOfMonth();
  }

  if (endDate) {
    dateFilter.lte = new Date(endDate as string);
  } else {
    // Por defecto, fin del mes actual
    dateFilter.lte = getEndOfMonth();
  }

  // Obtener totales de ingresos
  const incomesResult = await prisma.income.aggregate({
    where: {
      userId: req.user.id,
      date: dateFilter,
    },
    _sum: {
      amount: true,
    },
    _count: {
      id: true,
    },
  });

  // Obtener totales de gastos
  const expensesResult = await prisma.expense.aggregate({
    where: {
      userId: req.user.id,
      date: dateFilter,
    },
    _sum: {
      amount: true,
    },
    _count: {
      id: true,
    },
  });

  // Calcular balance usando dinero.js
  const totalIncome = createMoney(
    incomesResult._sum.amount?.toNumber() || 0,
    req.user.currency as 'MXN' | 'USD' | 'EUR'
  );

  const totalExpense = createMoney(
    expensesResult._sum.amount?.toNumber() || 0,
    req.user.currency as 'MXN' | 'USD' | 'EUR'
  );

  const balance = subtractMoney(totalIncome, totalExpense);

  // Calcular tasa de ahorro (savings rate)
const savingsRate =
  incomesResult._sum.amount?.toNumber() && incomesResult._sum.amount.toNumber() > 0
    ? (moneyToNumber(balance) / moneyToNumber(totalIncome)) * 100
    : 0;

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      period: {
        startDate: dateFilter.gte?.toISOString().split('T')[0],
        endDate: dateFilter.lte?.toISOString().split('T')[0],
      },
      summary: {
        totalIncome: moneyToDecimal(totalIncome),
        totalExpenses: moneyToDecimal(totalExpense),
        balance: moneyToDecimal(balance),
        savingsRate: parseFloat(savingsRate.toFixed(2)),
      },
      counts: {
        incomes: incomesResult._count.id,
        expenses: expensesResult._count.id,
        transactions: incomesResult._count.id + expensesResult._count.id,
      },
    },
  });
};

/**
 * Obtener desglose por categorías (Top 5 de ingresos y gastos)
 */
export const getCategoryBreakdown = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw createUnauthorizedError();
  }

  const { startDate, endDate } = req.query;

  // Construir filtro de fechas
  const dateFilter: {
    gte?: Date;
    lte?: Date;
  } = {};

  if (startDate) {
    dateFilter.gte = new Date(startDate as string);
  } else {
    dateFilter.gte = getStartOfMonth();
  }

  if (endDate) {
    dateFilter.lte = new Date(endDate as string);
  } else {
    dateFilter.lte = getEndOfMonth();
  }

  // Obtener ingresos por categoría
  const incomesByCategory = await prisma.income.groupBy({
    by: ['categoryId'],
    where: {
      userId: req.user.id,
      date: dateFilter,
    },
    _sum: {
      amount: true,
    },
    _count: {
      id: true,
    },
    orderBy: {
      _sum: {
        amount: 'desc',
      },
    },
    take: 5,
  });

  // Obtener información de categorías de ingresos
  const incomeCategoryIds = incomesByCategory.map((item) => item.categoryId);
  const incomeCategories = await prisma.category.findMany({
    where: { id: { in: incomeCategoryIds } },
  });

  // Calcular total de ingresos para porcentajes
  const totalIncome = incomesByCategory.reduce(
    (sum, item) => sum + (item._sum.amount?.toNumber() || 0),
    0
  );

  const topIncomeCategories = incomesByCategory.map((item) => {
    const category = incomeCategories.find((cat) => cat.id === item.categoryId);
    const amount = item._sum.amount?.toNumber() || 0;
    const percentage = totalIncome > 0 ? (amount / totalIncome) * 100 : 0;

    return {
      categoryId: item.categoryId,
      categoryName: category?.name || 'Desconocida',
      categoryColor: category?.color || '#6B7280',
      total: item._sum.amount?.toString() || '0',
      count: item._count.id,
      percentage: parseFloat(percentage.toFixed(2)),
    };
  });

  // Obtener gastos por categoría
  const expensesByCategory = await prisma.expense.groupBy({
    by: ['categoryId'],
    where: {
      userId: req.user.id,
      date: dateFilter,
    },
    _sum: {
      amount: true,
    },
    _count: {
      id: true,
    },
    orderBy: {
      _sum: {
        amount: 'desc',
      },
    },
    take: 5,
  });

  // Obtener información de categorías de gastos
  const expenseCategoryIds = expensesByCategory.map((item) => item.categoryId);
  const expenseCategories = await prisma.category.findMany({
    where: { id: { in: expenseCategoryIds } },
  });

  // Calcular total de gastos para porcentajes
  const totalExpenses = expensesByCategory.reduce(
    (sum, item) => sum + (item._sum.amount?.toNumber() || 0),
    0
  );

  const topExpenseCategories = expensesByCategory.map((item) => {
    const category = expenseCategories.find((cat) => cat.id === item.categoryId);
    const amount = item._sum.amount?.toNumber() || 0;
    const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;

    return {
      categoryId: item.categoryId,
      categoryName: category?.name || 'Desconocida',
      categoryColor: category?.color || '#6B7280',
      total: item._sum.amount?.toString() || '0',
      count: item._count.id,
      percentage: parseFloat(percentage.toFixed(2)),
    };
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      period: {
        startDate: dateFilter.gte?.toISOString().split('T')[0],
        endDate: dateFilter.lte?.toISOString().split('T')[0],
      },
      topIncomeCategories,
      topExpenseCategories,
    },
  });
};

/**
 * Obtener tendencias mensuales (últimos 6 meses o rango personalizado)
 */
export const getMonthlyTrends = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw createUnauthorizedError();
  }

  const { months = 6 } = req.query;
  const monthsCount = Math.min(parseInt(months as string), 12);

  // Calcular fecha de inicio (X meses atrás)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - monthsCount);
  startDate.setDate(1); // Primer día del mes

  // Obtener todos los ingresos del período
  const incomes = await prisma.income.findMany({
    where: {
      userId: req.user.id,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      amount: true,
      date: true,
    },
  });

  // Obtener todos los gastos del período
  const expenses = await prisma.expense.findMany({
    where: {
      userId: req.user.id,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      amount: true,
      date: true,
    },
  });

  // Agrupar por mes
  const monthlyData: Record<
    string,
    { income: number; expense: number; month: string; year: number }
  > = {};

  // Inicializar todos los meses
  for (let i = 0; i < monthsCount; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyData[key] = {
      income: 0,
      expense: 0,
      month: getMonthName(date.getMonth()),
      year: date.getFullYear(),
    };
  }

  // Sumar ingresos
  incomes.forEach((income) => {
    const date = new Date(income.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (monthlyData[key]) {
      monthlyData[key].income += income.amount.toNumber();
    }
  });

  // Sumar gastos
  expenses.forEach((expense) => {
    const date = new Date(expense.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (monthlyData[key]) {
      monthlyData[key].expense += expense.amount.toNumber();
    }
  });

  // Convertir a array y ordenar cronológicamente
  const trends = Object.entries(monthlyData)
    .map(([key, data]) => ({
      period: key,
      month: data.month,
      year: data.year,
      income: data.income.toFixed(2),
      expenses: data.expense.toFixed(2),
      balance: (data.income - data.expense).toFixed(2),
      savingsRate:
        data.income > 0
          ? parseFloat((((data.income - data.expense) / data.income) * 100).toFixed(2))
          : 0,
    }))
    .sort((a, b) => a.period.localeCompare(b.period));

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      monthsCount,
      trends,
    },
  });
};

/**
 * Comparar dos períodos
 */
export const getComparison = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw createUnauthorizedError();
  }

  const {
    period1Start,
    period1End,
    period2Start,
    period2End,
  } = req.query;

  if (!period1Start || !period1End || !period2Start || !period2End) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Se requieren las fechas de ambos períodos',
    });
    return;
  }

  // Período 1
  const period1Incomes = await prisma.income.aggregate({
    where: {
      userId: req.user.id,
      date: {
        gte: new Date(period1Start as string),
        lte: new Date(period1End as string),
      },
    },
    _sum: { amount: true },
    _count: { id: true },
  });

  const period1Expenses = await prisma.expense.aggregate({
    where: {
      userId: req.user.id,
      date: {
        gte: new Date(period1Start as string),
        lte: new Date(period1End as string),
      },
    },
    _sum: { amount: true },
    _count: { id: true },
  });

  // Período 2
  const period2Incomes = await prisma.income.aggregate({
    where: {
      userId: req.user.id,
      date: {
        gte: new Date(period2Start as string),
        lte: new Date(period2End as string),
      },
    },
    _sum: { amount: true },
    _count: { id: true },
  });

  const period2Expenses = await prisma.expense.aggregate({
    where: {
      userId: req.user.id,
      date: {
        gte: new Date(period2Start as string),
        lte: new Date(period2End as string),
      },
    },
    _sum: { amount: true },
    _count: { id: true },
  });

  // Calcular diferencias
  const incomeChange =
    period1Incomes._sum.amount && period2Incomes._sum.amount
      ? ((period2Incomes._sum.amount.toNumber() - period1Incomes._sum.amount.toNumber()) /
          period1Incomes._sum.amount.toNumber()) *
        100
      : 0;

  const expenseChange =
    period1Expenses._sum.amount && period2Expenses._sum.amount
      ? ((period2Expenses._sum.amount.toNumber() - period1Expenses._sum.amount.toNumber()) /
          period1Expenses._sum.amount.toNumber()) *
        100
      : 0;

  const balance1 =
    (period1Incomes._sum.amount?.toNumber() || 0) -
    (period1Expenses._sum.amount?.toNumber() || 0);

  const balance2 =
    (period2Incomes._sum.amount?.toNumber() || 0) -
    (period2Expenses._sum.amount?.toNumber() || 0);

  const balanceChange = balance1 !== 0 ? ((balance2 - balance1) / balance1) * 100 : 0;

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      period1: {
        startDate: period1Start,
        endDate: period1End,
        income: period1Incomes._sum.amount?.toString() || '0',
        expenses: period1Expenses._sum.amount?.toString() || '0',
        balance: balance1.toFixed(2),
        transactions: period1Incomes._count.id + period1Expenses._count.id,
      },
      period2: {
        startDate: period2Start,
        endDate: period2End,
        income: period2Incomes._sum.amount?.toString() || '0',
        expenses: period2Expenses._sum.amount?.toString() || '0',
        balance: balance2.toFixed(2),
        transactions: period2Incomes._count.id + period2Expenses._count.id,
      },
      changes: {
        income: parseFloat(incomeChange.toFixed(2)),
        expenses: parseFloat(expenseChange.toFixed(2)),
        balance: parseFloat(balanceChange.toFixed(2)),
      },
    },
  });
};

/**
 * Obtener transacciones recientes
 */
export const getRecentTransactions = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw createUnauthorizedError();
  }

  const { limit = 10 } = req.query;
  const limitNum = Math.min(parseInt(limit as string), 50);

  // Obtener ingresos recientes
  const recentIncomes = await prisma.income.findMany({
    where: { userId: req.user.id },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          color: true,
          type: true,
        },
      },
    },
    orderBy: { date: 'desc' },
    take: limitNum,
  });

  // Obtener gastos recientes
  const recentExpenses = await prisma.expense.findMany({
    where: { userId: req.user.id },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          color: true,
          type: true,
        },
      },
    },
    orderBy: { date: 'desc' },
    take: limitNum,
  });

  // Combinar y ordenar
  const transactions = [
    ...recentIncomes.map((income) => ({
      id: income.id,
      type: 'income' as const,
      description: income.concept,
      amount: income.amount.toString(),
      date: income.date,
      category: income.category,
      createdAt: income.createdAt,
    })),
    ...recentExpenses.map((expense) => ({
      id: expense.id,
      type: 'expense' as const,
      description: expense.description,
      amount: expense.amount.toString(),
      date: expense.date,
      category: expense.category,
      paymentMethod: expense.paymentMethod,
      createdAt: expense.createdAt,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limitNum);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: transactions,
  });
};