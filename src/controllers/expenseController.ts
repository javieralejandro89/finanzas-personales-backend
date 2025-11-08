import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { prisma } from '../config/prisma';
import { sanitizeText, parseDate, formatDateOnly } from '../utils/validators';
import { createMoney, moneyToDecimal, isPositive } from '../utils/money';
import {
  createUnauthorizedError,
  createNotFoundError,
  AppError,
} from '../middlewares/errorHandler';
import { HTTP_STATUS, PAGINATION } from '../config/constants';
import { Decimal } from '@prisma/client/runtime/library';
import { PaymentMethod } from '@prisma/client';

/**
 * Crear nuevo gasto
 */
export const createExpense = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw createUnauthorizedError();
  }

  const { description, amount, date, notes, paymentMethod, categoryId } = req.body;

  // Validar que la categoría exista y sea del usuario
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category || category.userId !== req.user.id) {
    throw createNotFoundError('Categoría');
  }

  // Validar que la categoría sea de tipo "expense"
  if (category.type !== 'expense') {
    throw new AppError(
      'La categoría debe ser de tipo gasto',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Validar que la categoría esté activa
  if (!category.isActive) {
    throw new AppError('La categoría está inactiva', HTTP_STATUS.BAD_REQUEST);
  }

  // Validar y convertir monto usando dinero.js
  const money = createMoney(amount, req.user.currency as 'MXN' | 'USD' | 'EUR');

  if (!isPositive(money)) {
    throw new AppError(
      'El monto debe ser mayor a cero',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Parsear fecha
  const parsedDate = parseDate(date);

  // Crear gasto
  const expense = await prisma.expense.create({
    data: {
      description: sanitizeText(description),
      amount: new Decimal(moneyToDecimal(money)),
      date: parsedDate,
      notes: notes ? sanitizeText(notes) : null,
      paymentMethod: paymentMethod || PaymentMethod.cash,
      userId: req.user.id,
      categoryId,
    },
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
  });

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Gasto creado exitosamente',
    data: {
      ...expense,
      amount: expense.amount.toString(),
    },
  });
};

/**
 * Obtener todos los gastos del usuario con filtros y paginación
 */
export const getExpenses = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw createUnauthorizedError();
  }

  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    categoryId,
    paymentMethod,
    startDate,
    endDate,
  } = req.query;

  // Validar y parsear paginación
  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(limit as string))
  );
  const skip = (pageNum - 1) * limitNum;

  // Construir filtros
  const where: {
    userId: number;
    categoryId?: number;
    paymentMethod?: PaymentMethod;
    date?: {
      gte?: Date;
      lte?: Date;
    };
  } = {
    userId: req.user.id,
  };

  if (categoryId) {
    where.categoryId = parseInt(categoryId as string);
  }

  if (paymentMethod) {
    where.paymentMethod = paymentMethod as PaymentMethod;
  }

  if (startDate || endDate) {
    where.date = {};
    if (startDate) {
      where.date.gte = new Date(startDate as string);
    }
    if (endDate) {
      where.date.lte = new Date(endDate as string);
    }
  }

  // Obtener total de registros
  const total = await prisma.expense.count({ where });

  // Obtener gastos
  const expenses = await prisma.expense.findMany({
    where,
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
    skip,
    take: limitNum,
  });

  // Formatear montos
  const formattedExpenses = expenses.map((expense) => ({
    ...expense,
    amount: expense.amount.toString(),
  }));

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: formattedExpenses,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
};

/**
 * Obtener un gasto por ID
 */
export const getExpenseById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw createUnauthorizedError();
  }

  const { id } = req.params;

  const expense = await prisma.expense.findUnique({
    where: { id: parseInt(id) },
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
  });

  if (!expense || expense.userId !== req.user.id) {
    throw createNotFoundError('Gasto');
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      ...expense,
      amount: expense.amount.toString(),
    },
  });
};

/**
 * Actualizar gasto
 */
export const updateExpense = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw createUnauthorizedError();
  }

  const { id } = req.params;
  const { description, amount, date, notes, paymentMethod, categoryId } = req.body;

  // Verificar que el gasto exista y pertenezca al usuario
  const expense = await prisma.expense.findUnique({
    where: { id: parseInt(id) },
  });

  if (!expense || expense.userId !== req.user.id) {
    throw createNotFoundError('Gasto');
  }

  // Construir datos a actualizar
  const updateData: {
    description?: string;
    amount?: Decimal;
    date?: Date;
    notes?: string | null;
    paymentMethod?: PaymentMethod;
    categoryId?: number;
  } = {};

  if (description !== undefined) {
    updateData.description = sanitizeText(description);
  }

  if (amount !== undefined) {
    const money = createMoney(amount, req.user.currency as 'MXN' | 'USD' | 'EUR');

    if (!isPositive(money)) {
      throw new AppError(
        'El monto debe ser mayor a cero',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    updateData.amount = new Decimal(moneyToDecimal(money));
  }

  if (date !== undefined) {
    updateData.date = parseDate(date);
  }

  if (notes !== undefined) {
    updateData.notes = notes ? sanitizeText(notes) : null;
  }

  if (paymentMethod !== undefined) {
    updateData.paymentMethod = paymentMethod as PaymentMethod;
  }

  if (categoryId !== undefined) {
    // Validar que la categoría exista y sea del usuario
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category || category.userId !== req.user.id) {
      throw createNotFoundError('Categoría');
    }

    // Validar que la categoría sea de tipo "expense"
    if (category.type !== 'expense') {
      throw new AppError(
        'La categoría debe ser de tipo gasto',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Validar que la categoría esté activa
    if (!category.isActive) {
      throw new AppError('La categoría está inactiva', HTTP_STATUS.BAD_REQUEST);
    }

    updateData.categoryId = categoryId;
  }

  // Actualizar gasto
  const updatedExpense = await prisma.expense.update({
    where: { id: parseInt(id) },
    data: updateData,
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
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Gasto actualizado exitosamente',
    data: {
      ...updatedExpense,
      amount: updatedExpense.amount.toString(),
    },
  });
};

/**
 * Eliminar gasto
 */
export const deleteExpense = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw createUnauthorizedError();
  }

  const { id } = req.params;

  // Verificar que el gasto exista y pertenezca al usuario
  const expense = await prisma.expense.findUnique({
    where: { id: parseInt(id) },
  });

  if (!expense || expense.userId !== req.user.id) {
    throw createNotFoundError('Gasto');
  }

  // Eliminar gasto
  await prisma.expense.delete({
    where: { id: parseInt(id) },
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Gasto eliminado exitosamente',
  });
};

/**
 * Obtener resumen de gastos
 */
export const getExpenseSummary = async (
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
  }

  if (endDate) {
    dateFilter.lte = new Date(endDate as string);
  }

  // Obtener resumen
  const result = await prisma.expense.aggregate({
    where: {
      userId: req.user.id,
      ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
    },
    _sum: {
      amount: true,
    },
    _count: {
      id: true,
    },
    _avg: {
      amount: true,
    },
  });

  // Obtener gasto más alto y más bajo
  const highestExpense = await prisma.expense.findFirst({
    where: {
      userId: req.user.id,
      ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
    },
    orderBy: { amount: 'desc' },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
  });

  const lowestExpense = await prisma.expense.findFirst({
    where: {
      userId: req.user.id,
      ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
    },
    orderBy: { amount: 'asc' },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
  });

  // Obtener resumen por método de pago
  const byPaymentMethod = await prisma.expense.groupBy({
    by: ['paymentMethod'],
    where: {
      userId: req.user.id,
      ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
    },
    _sum: {
      amount: true,
    },
    _count: {
      id: true,
    },
  });

  const paymentMethodSummary = byPaymentMethod.map((item) => ({
    paymentMethod: item.paymentMethod,
    total: item._sum.amount?.toString() || '0',
    count: item._count.id,
  }));

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      total: result._sum.amount?.toString() || '0',
      count: result._count.id,
      average: result._avg.amount?.toString() || '0',
      highest: highestExpense
        ? {
            ...highestExpense,
            amount: highestExpense.amount.toString(),
          }
        : null,
      lowest: lowestExpense
        ? {
            ...lowestExpense,
            amount: lowestExpense.amount.toString(),
          }
        : null,
      byPaymentMethod: paymentMethodSummary,
      period: {
        startDate: startDate ? formatDateOnly(new Date(startDate as string)) : null,
        endDate: endDate ? formatDateOnly(new Date(endDate as string)) : null,
      },
    },
  });
};