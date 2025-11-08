import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../types';
import { HTTP_STATUS, ERROR_MESSAGES, CONFIG } from '../config/constants';
import { Prisma } from '@prisma/client';

/**
 * Clase de error personalizado para la aplicación
 */
export class AppError extends Error implements CustomError {
  statusCode: number;
  errors?: Record<string, string[]>;

  constructor(
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    errors?: Record<string, string[]>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = 'AppError';

    // Mantener stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Crear error de no encontrado
 */
export const createNotFoundError = (resource: string): AppError => {
  return new AppError(`${resource} no encontrado`, HTTP_STATUS.NOT_FOUND);
};

/**
 * Crear error de no autorizado
 */
export const createUnauthorizedError = (
  message: string = ERROR_MESSAGES.UNAUTHORIZED
): AppError => {
  return new AppError(message, HTTP_STATUS.UNAUTHORIZED);
};

/**
 * Crear error de conflicto
 */
export const createConflictError = (message: string): AppError => {
  return new AppError(message, HTTP_STATUS.CONFLICT);
};

/**
 * Crear error de validación
 */
export const createValidationError = (
  errors: Record<string, string[]>
): AppError => {
  return new AppError(
    ERROR_MESSAGES.VALIDATION_ERROR,
    HTTP_STATUS.UNPROCESSABLE_ENTITY,
    errors
  );
};

/**
 * Crear error de solicitud incorrecta
 */
export const createBadRequestError = (message: string): AppError => {
  return new AppError(message, HTTP_STATUS.BAD_REQUEST);
};

/**
 * Manejar errores de Prisma
 */
const handlePrismaError = (error: Prisma.PrismaClientKnownRequestError): AppError => {
  switch (error.code) {
    case 'P2002': {
      // Violación de constraint único
      const field = (error.meta?.target as string[])?.join(', ') || 'campo';
      return new AppError(
        `Ya existe un registro con ese ${field}`,
        HTTP_STATUS.CONFLICT
      );
    }
    case 'P2003': {
      // Violación de foreign key
      return new AppError(
        'El recurso referenciado no existe',
        HTTP_STATUS.BAD_REQUEST
      );
    }
    case 'P2025': {
      // Registro no encontrado
      return new AppError(
        ERROR_MESSAGES.RESOURCE_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND
      );
    }
    default: {
      return new AppError(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }
};

/**
 * Middleware de manejo de errores
 * Debe ser el último middleware en la cadena
 */
export const errorHandler = (
  error: Error | AppError | Prisma.PrismaClientKnownRequestError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  // Log del error en desarrollo
  if (CONFIG.NODE_ENV === 'development') {
    console.error('Error capturado:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
  }

  // Manejar errores de Prisma
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const appError = handlePrismaError(error);
    res.status(appError.statusCode).json({
      success: false,
      message: appError.message,
      errors: appError.errors,
    });
    return;
  }

  // Manejar errores de la aplicación
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errors: error.errors,
    });
    return;
  }

  // Errores no manejados
  console.error('Error no manejado:', error);

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message:
      CONFIG.NODE_ENV === 'development'
        ? error.message
        : ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
  });
};

/**
 * Middleware para manejar rutas no encontradas
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.path}`,
  });
};

/**
 * Wrapper para funciones async en rutas
 * Captura errores y los pasa al error handler
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};