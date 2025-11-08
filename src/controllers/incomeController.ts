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

/**
 * Crear nuevo ingreso
 */
export const createIncome = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw createUnauthorizedError();
  }

  const { concept, amount, date, description, categoryId } = req.body;

  // Validar que la categoría exista y sea del usuario
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category || category.userId !== req.user.id) {
    throw createNotFoundError('Categoría');
  }

  // Validar que la categoría sea de tipo "income"
  if (category.type !== 'income') {
    throw new AppError(
      'La categoría debe ser de tipo ingreso',
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

  // Crear ingreso
  const income = await prisma.income.create({
    data: {
      concept: sanitizeText(concept),
      amount: new Decimal(moneyToDecimal(money)),
      date: parsedDate,
      description: description ? sanitizeText(description) : null,
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
    message: 'Ingreso creado exitosamente',
    data: {
      ...income,
      amount: income.amount.toString(),
    },
  });
};

/**
 * Obtener todos los ingresos del usuario con filtros y paginación
 */
export const getIncomes = async (
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
  const total = await prisma.income.count({ where });

  // Obtener ingresos
  const incomes = await prisma.income.findMany({
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
  const formattedIncomes = incomes.map((income) => ({
    ...income,
    amount: income.amount.toString(),
  }));

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: formattedIncomes,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
};

/**
 * Obtener un ingreso por ID
 */
export const getIncomeById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw createUnauthorizedError();
  }

  const { id } = req.params;

  const income = await prisma.income.findUnique({
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

  if (!income || income.userId !== req.user.id) {
    throw createNotFoundError('Ingreso');
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      ...income,
      amount: income.amount.toString(),
    },
  });
};

/**
 * Actualizar ingreso
 */
export const updateIncome = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw createUnauthorizedError();
  }

  const { id } = req.params;
  const { concept, amount, date, description, categoryId } = req.body;

  // Verificar que el ingreso exista y pertenezca al usuario
  const income = await prisma.income.findUnique({
    where: { id: parseInt(id) },
  });

  if (!income || income.userId !== req.user.id) {
    throw createNotFoundError('Ingreso');
  }

  // Construir datos a actualizar
  const updateData: {
    concept?: string;
    amount?: Decimal;
    date?: Date;
    description?: string | null;
    categoryId?: number;
  } = {};

  if (concept !== undefined) {
    updateData.concept = sanitizeText(concept);
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

  if (description !== undefined) {
    updateData.description = description ? sanitizeText(description) : null;
  }

  if (categoryId !== undefined) {
    // Validar que la categoría exista y sea del usuario
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category || category.userId !== req.user.id) {
      throw createNotFoundError('Categoría');
    }

    // Validar que la categoría sea de tipo "income"
    if (category.type !== 'income') {
      throw new AppError(
        'La categoría debe ser de tipo ingreso',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Validar que la categoría esté activa
    if (!category.isActive) {
      throw new AppError('La categoría está inactiva', HTTP_STATUS.BAD_REQUEST);
    }

    updateData.categoryId = categoryId;
  }

  // Actualizar ingreso
  const updatedIncome = await prisma.income.update({
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
    message: 'Ingreso actualizado exitosamente',
    data: {
      ...updatedIncome,
      amount: updatedIncome.amount.toString(),
    },
  });
};

/**
 * Eliminar ingreso
 */
export const deleteIncome = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw createUnauthorizedError();
  }

  const { id } = req.params;

  // Verificar que el ingreso exista y pertenezca al usuario
  const income = await prisma.income.findUnique({
    where: { id: parseInt(id) },
  });

  if (!income || income.userId !== req.user.id) {
    throw createNotFoundError('Ingreso');
  }

  // Eliminar ingreso
  await prisma.income.delete({
    where: { id: parseInt(id) },
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Ingreso eliminado exitosamente',
  });
};

/**
 * Obtener resumen de ingresos
 */
export const getIncomeSummary = async (
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
  const result = await prisma.income.aggregate({
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

  // Obtener ingreso más alto y más bajo
  const highestIncome = await prisma.income.findFirst({
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

  const lowestIncome = await prisma.income.findFirst({
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

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      total: result._sum.amount?.toString() || '0',
      count: result._count.id,
      average: result._avg.amount?.toString() || '0',
      highest: highestIncome
        ? {
            ...highestIncome,
            amount: highestIncome.amount.toString(),
          }
        : null,
      lowest: lowestIncome
        ? {
            ...lowestIncome,
            amount: lowestIncome.amount.toString(),
          }
        : null,
      period: {
        startDate: startDate ? formatDateOnly(new Date(startDate as string)) : null,
        endDate: endDate ? formatDateOnly(new Date(endDate as string)) : null,
      },
    },
  });
};