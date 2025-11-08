import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { verifyAccessToken, extractTokenFromHeader } from '../utils/jwt';
import { prisma } from '../config/prisma';
import { ERROR_MESSAGES, HTTP_STATUS } from '../config/constants';

/**
 * Middleware de autenticación
 * Verifica el Access Token y agrega el usuario al request
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extraer token del header
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
      });
      return;
    }

    // Verificar token
    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : ERROR_MESSAGES.TOKEN_INVALID;

      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: errorMessage,
      });
      return;
    }

    // Buscar usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        currency: true,
        isActive: true,
      },
    });

    // Validar que el usuario exista y esté activo
    if (!user || !user.isActive) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND,
      });
      return;
    }

    // Agregar usuario al request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      currency: user.currency,
    };

    next();
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * Middleware opcional de autenticación
 * Agrega el usuario al request si el token es válido, pero no falla si no hay token
 */
export const optionalAuthenticate = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (token) {
      try {
        const payload = verifyAccessToken(token);

        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: {
            id: true,
            email: true,
            name: true,
            currency: true,
            isActive: true,
          },
        });

        if (user && user.isActive) {
          req.user = {
            id: user.id,
            email: user.email,
            name: user.name,
            currency: user.currency,
          };
        }
      } catch {
        // Ignorar errores de token inválido en autenticación opcional
      }
    }

    next();
  } catch (error) {
    console.error('Error en middleware de autenticación opcional:', error);
    next();
  }
};