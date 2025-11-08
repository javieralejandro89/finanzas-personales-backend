import jwt from 'jsonwebtoken';
import { CONFIG } from '../config/constants';
import { JWTAccessPayload, JWTRefreshPayload } from '../types';

/**
 * Generar Access Token
 * @param userId ID del usuario
 * @param email Email del usuario
 * @returns Access Token JWT
 */
export const generateAccessToken = (userId: number, email: string): string => {
  const payload: JWTAccessPayload = {
    userId,
    email,
    type: 'access',
  };

  return jwt.sign(payload, CONFIG.JWT_ACCESS_SECRET, {
  expiresIn: CONFIG.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
});
};

/**
 * Generar Refresh Token
 * @param userId ID del usuario
 * @param sessionId ID de la sesión
 * @returns Refresh Token JWT
 */
export const generateRefreshToken = (
  userId: number,
  sessionId: string
): string => {
  const payload: JWTRefreshPayload = {
    userId,
    sessionId,
    type: 'refresh',
  };

  return jwt.sign(payload, CONFIG.JWT_REFRESH_SECRET, {
  expiresIn: CONFIG.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
});
};

/**
 * Verificar Access Token
 * @param token Token a verificar
 * @returns Payload del token si es válido
 * @throws Error si el token es inválido
 */
export const verifyAccessToken = (token: string): JWTAccessPayload => {
  try {
    const decoded = jwt.verify(token, CONFIG.JWT_ACCESS_SECRET) as JWTAccessPayload;

    if (decoded.type !== 'access') {
      throw new Error('Tipo de token inválido');
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expirado');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Token inválido');
    }
    throw error;
  }
};

/**
 * Verificar Refresh Token
 * @param token Token a verificar
 * @returns Payload del token si es válido
 * @throws Error si el token es inválido
 */
export const verifyRefreshToken = (token: string): JWTRefreshPayload => {
  try {
    const decoded = jwt.verify(token, CONFIG.JWT_REFRESH_SECRET) as JWTRefreshPayload;

    if (decoded.type !== 'refresh') {
      throw new Error('Tipo de token inválido');
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expirado');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Token inválido');
    }
    throw error;
  }
};

/**
 * Extraer token del header Authorization
 * @param authHeader Header de autorización
 * @returns Token extraído o null
 */
export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

/**
 * Calcular fecha de expiración basada en una duración
 * @param duration Duración en formato de jsonwebtoken (ej: '7d', '15m')
 * @returns Fecha de expiración
 */
export const calculateExpirationDate = (duration: string): Date => {
  const now = new Date();
  
  // Parsear la duración
  const match = duration.match(/^(\d+)([smhd])$/);
  
  if (!match) {
    throw new Error('Formato de duración inválido');
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's':
      return new Date(now.getTime() + value * 1000);
    case 'm':
      return new Date(now.getTime() + value * 60 * 1000);
    case 'h':
      return new Date(now.getTime() + value * 60 * 60 * 1000);
    case 'd':
      return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
    default:
      throw new Error('Unidad de tiempo inválida');
  }
};

/**
 * Decodificar token sin verificar (útil para debugging)
 * @param token Token a decodificar
 * @returns Payload del token
 */
export const decodeToken = (token: string): JWTAccessPayload | JWTRefreshPayload | null => {
  try {
    return jwt.decode(token) as JWTAccessPayload | JWTRefreshPayload;
  } catch {
    return null;
  }
};

/**
 * Verificar si un token ha expirado
 * @param token Token a verificar
 * @returns true si ha expirado
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  
  if (!decoded || !('exp' in decoded)) {
    return true;
  }

  const exp = decoded.exp as number;
  const now = Math.floor(Date.now() / 1000);

  return exp < now;
};