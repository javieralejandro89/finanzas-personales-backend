import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { prisma } from '../config/prisma';
import { sanitizeText, isValidHexColor } from '../utils/validators';
import {
  AppError,
  createUnauthorizedError,
  createNotFoundError,
  createConflictError,
} from '../middlewares/errorHandler';
import { HTTP_STATUS } from '../config/constants';

/**
 * Crear nueva categoría
 */
export const createCategory = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw createUnauthorizedError();
  }

  const { name, type, color } = req.body;

  // Verificar que no exista una categoría con el mismo nombre y tipo
  const existingCategory = await prisma.category.findFirst({
    where: {
      name: sanitizeText(name),
      type,
      userId: req.user.id,
    },
  });

  if (existingCategory) {
    throw createConflictError(
      `Ya existe una categoría de ${type === 'income' ? 'ingresos' : 'gastos'} con ese nombre`
    );
  }

  // Validar color si se proporciona
  if (color && !isValidHexColor(color)) {
    throw new AppError('Color hexadecimal inválido', HTTP_STATUS.BAD_REQUEST);
  }

  // Crear categoría
  const category = await prisma.category.create({
    data: {
      name: sanitizeText(name),
      type,
      color: color || '#6B7280',
      userId: req.user.id,
    },
  });

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Categoría creada exitosamente',
    data: category,
  });
};

/**
 * Obtener todas las categorías del usuario
 */
export const getCategories = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw createUnauthorizedError();
  }

  const { type, isActive } = req.query;

  // Construir filtros
  const where: {
    userId: number;
    type?: 'income' | 'expense';
    isActive?: boolean;
  } = {
    userId: req.user.id,
  };

  if (type && (type === 'income' || type === 'expense')) {
    where.type = type;
  }

  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }

  // Obtener categorías
  const categories = await prisma.category.findMany({
    where,
    orderBy: [{ type: 'asc' }, { name: 'asc' }],
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: categories,
  });
};

/**
 * Obtener una categoría por ID
 */
export const getCategoryById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw createUnauthorizedError();
  }

  const { id } = req.params;

  const category = await prisma.category.findUnique({
    where: { id: parseInt(id) },
  });

  if (!category || category.userId !== req.user.id) {
    throw createNotFoundError('Categoría');
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: category,
  });
};

/**
 * Actualizar categoría
 */
export const updateCategory = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw createUnauthorizedError();
  }

  const { id } = req.params;
  const { name, color, isActive } = req.body;

  // Verificar que la categoría exista y pertenezca al usuario
  const category = await prisma.category.findUnique({
    where: { id: parseInt(id) },
  });

  if (!category || category.userId !== req.user.id) {
    throw createNotFoundError('Categoría');
  }

  // Construir datos a actualizar
  const updateData: {
    name?: string;
    color?: string;
    isActive?: boolean;
  } = {};

  if (name !== undefined) {
    const sanitizedName = sanitizeText(name);

    // Verificar que no exista otra categoría con el mismo nombre y tipo
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: sanitizedName,
        type: category.type,
        userId: req.user.id,
        id: { not: parseInt(id) },
      },
    });

    if (existingCategory) {
      throw createConflictError(
        `Ya existe otra categoría de ${category.type === 'income' ? 'ingresos' : 'gastos'} con ese nombre`
      );
    }

    updateData.name = sanitizedName;
  }

  if (color !== undefined) {
    if (!isValidHexColor(color)) {
      throw new AppError('Color hexadecimal inválido', HTTP_STATUS.BAD_REQUEST);
    }
    updateData.color = color;
  }

  if (isActive !== undefined) {
    updateData.isActive = isActive;
  }

  // Actualizar categoría
  const updatedCategory = await prisma.category.update({
    where: { id: parseInt(id) },
    data: updateData,
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Categoría actualizada exitosamente',
    data: updatedCategory,
  });
};

/**
 * Eliminar (desactivar) categoría
 */
export const deleteCategory = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw createUnauthorizedError();
  }

  const { id } = req.params;

  // Verificar que la categoría exista y pertenezca al usuario
  const category = await prisma.category.findUnique({
    where: { id: parseInt(id) },
    include: {
      _count: {
        select: {
          incomes: true,
          expenses: true,
        },
      },
    },
  });

  if (!category || category.userId !== req.user.id) {
    throw createNotFoundError('Categoría');
  }

  // Verificar si tiene transacciones asociadas
  const hasTransactions =
    category._count.incomes > 0 || category._count.expenses > 0;

  if (hasTransactions) {
    // Si tiene transacciones, solo desactivar
    await prisma.category.update({
      where: { id: parseInt(id) },
      data: { isActive: false },
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message:
        'Categoría desactivada exitosamente. No se puede eliminar porque tiene transacciones asociadas.',
    });
  } else {
    // Si no tiene transacciones, eliminar permanentemente
    await prisma.category.delete({
      where: { id: parseInt(id) },
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Categoría eliminada exitosamente',
    });
  }
};

/**
 * Obtener estadísticas de categorías
 */
export const getCategoryStats = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw createUnauthorizedError();
  }

  const { type, startDate, endDate } = req.query;

  // Validar tipo
  if (type && type !== 'income' && type !== 'expense') {
    throw new AppError('Tipo de categoría inválido', HTTP_STATUS.BAD_REQUEST);
  }

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

  // Obtener estadísticas según el tipo
  let stats;

  if (!type || type === 'income') {
    const incomeStats = await prisma.income.groupBy({
      by: ['categoryId'],
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

    // Obtener información de las categorías
    const categoryIds = incomeStats.map((stat) => stat.categoryId);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
    });

    const incomeData = incomeStats.map((stat) => {
      const category = categories.find((cat) => cat.id === stat.categoryId);
      return {
        categoryId: stat.categoryId,
        categoryName: category?.name || 'Desconocida',
        categoryColor: category?.color || '#6B7280',
        total: stat._sum.amount?.toString() || '0',
        count: stat._count.id,
      };
    });

    stats = { incomes: incomeData };
  }

  if (!type || type === 'expense') {
    const expenseStats = await prisma.expense.groupBy({
      by: ['categoryId'],
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

    // Obtener información de las categorías
    const categoryIds = expenseStats.map((stat) => stat.categoryId);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
    });

    const expenseData = expenseStats.map((stat) => {
      const category = categories.find((cat) => cat.id === stat.categoryId);
      return {
        categoryId: stat.categoryId,
        categoryName: category?.name || 'Desconocida',
        categoryColor: category?.color || '#6B7280',
        total: stat._sum.amount?.toString() || '0',
        count: stat._count.id,
      };
    });

    stats = { ...stats, expenses: expenseData };
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: stats,
  });
};