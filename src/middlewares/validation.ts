import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { formatValidationErrors } from '../utils/validators';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants';

/**
 * Middleware de validación
 * Verifica los resultados de express-validator y retorna errores formateados
 */
export const validate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
      success: false,
      message: ERROR_MESSAGES.VALIDATION_ERROR,
      errors: formatValidationErrors(errors.array()),
    });
    return;
  }

  next();
};

/**
 * Ejecutar validaciones en secuencia
 * @param validations Array de validaciones de express-validator
 * @returns Middleware que ejecuta las validaciones
 */
export const runValidations = (validations: ValidationChain[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    // Ejecutar todas las validaciones
    for (const validation of validations) {
      await validation.run(req);
    }

    // Verificar resultados
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
        success: false,
        message: ERROR_MESSAGES.VALIDATION_ERROR,
        errors: formatValidationErrors(errors.array()),
      });
      return;
    }

    next();
  };
};