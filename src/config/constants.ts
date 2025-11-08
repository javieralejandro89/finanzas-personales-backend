import dotenv from 'dotenv';

dotenv.config();

/**
 * Constantes de configuración de la aplicación
 */
export const CONFIG = {
  // Servidor
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  
  // JWT
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'your-access-secret-key',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  // CORS
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // Moneda
  DEFAULT_CURRENCY: process.env.DEFAULT_CURRENCY || 'MXN',
  
  // Base de datos
  DATABASE_URL: process.env.DATABASE_URL || '',
} as const;

/**
 * Validar que las variables de entorno críticas existan
 */
export const validateEnv = (): void => {
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
  ];

  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Faltan las siguientes variables de entorno: ${missingEnvVars.join(', ')}`
    );
  }

  // Advertencia si se usan los valores por defecto en producción
  if (CONFIG.NODE_ENV === 'production') {
    if (
      CONFIG.JWT_ACCESS_SECRET === 'your-access-secret-key' ||
      CONFIG.JWT_REFRESH_SECRET === 'your-refresh-secret-key'
    ) {
      throw new Error(
        'NO PUEDES USAR LOS SECRETS POR DEFECTO EN PRODUCCIÓN'
      );
    }
  }
};

/**
 * Constantes de validación
 */
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 100,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  EMAIL_MAX_LENGTH: 255,
  CONCEPT_MAX_LENGTH: 255,
  DESCRIPTION_MAX_LENGTH: 1000,
  CATEGORY_NAME_MAX_LENGTH: 100,
} as const;

/**
 * Constantes de paginación
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

/**
 * Códigos HTTP
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Mensajes de error comunes
 */
export const ERROR_MESSAGES = {
  // Autenticación
  INVALID_CREDENTIALS: 'Credenciales inválidas',
  EMAIL_ALREADY_EXISTS: 'El email ya está registrado',
  TOKEN_EXPIRED: 'Token expirado',
  TOKEN_INVALID: 'Token inválido',
  UNAUTHORIZED: 'No autorizado',
  SESSION_NOT_FOUND: 'Sesión no encontrada',
  
  // Validación
  VALIDATION_ERROR: 'Error de validación',
  REQUIRED_FIELD: 'Campo requerido',
  INVALID_EMAIL: 'Email inválido',
  PASSWORD_TOO_SHORT: `La contraseña debe tener al menos ${VALIDATION.PASSWORD_MIN_LENGTH} caracteres`,
  
  // Recursos
  USER_NOT_FOUND: 'Usuario no encontrado',
  CATEGORY_NOT_FOUND: 'Categoría no encontrada',
  INCOME_NOT_FOUND: 'Ingreso no encontrado',
  EXPENSE_NOT_FOUND: 'Gasto no encontrado',
  
  // Permisos
  NOT_OWNER: 'No tienes permiso para acceder a este recurso',
  
  // General
  INTERNAL_SERVER_ERROR: 'Error interno del servidor',
  RESOURCE_NOT_FOUND: 'Recurso no encontrado',
} as const;

/**
 * Monedas soportadas (ISO 4217)
 */
export const SUPPORTED_CURRENCIES = [
  'MXN', // Peso Mexicano
  'USD', // Dólar Estadounidense
  'EUR', // Euro
  'GBP', // Libra Esterlina
  'CAD', // Dólar Canadiense
  'ARS', // Peso Argentino
  'COP', // Peso Colombiano
  'CLP', // Peso Chileno
] as const;

export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];