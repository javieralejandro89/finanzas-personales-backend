import { ValidationError } from 'express-validator';
import bcrypt from 'bcrypt';

/**
 * Hash de contraseña con bcrypt
 * @param password Contraseña en texto plano
 * @returns Contraseña hasheada
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Comparar contraseña con hash
 * @param password Contraseña en texto plano
 * @param hash Hash almacenado
 * @returns true si coinciden
 */
export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

/**
 * Formatear errores de express-validator
 * @param errors Array de errores de validación
 * @returns Objeto con errores por campo
 */
export const formatValidationErrors = (
  errors: ValidationError[]
): Record<string, string[]> => {
  const formattedErrors: Record<string, string[]> = {};

  errors.forEach((error) => {
    if (error.type === 'field') {
      const field = error.path;
      if (!formattedErrors[field]) {
        formattedErrors[field] = [];
      }
      formattedErrors[field].push(error.msg);
    }
  });

  return formattedErrors;
};

/**
 * Validar formato de email
 * @param email Email a validar
 * @returns true si es válido
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validar formato de color hexadecimal
 * @param color Color en formato hex
 * @returns true si es válido
 */
export const isValidHexColor = (color: string): boolean => {
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexColorRegex.test(color);
};

/**
 * Parsear fecha en formato ISO o Date
 * @param date Fecha como string o Date
 * @returns Objeto Date
 */
export const parseDate = (date: string | Date): Date => {
  if (date instanceof Date) {
    return date;
  }

  const parsed = new Date(date);

  if (isNaN(parsed.getTime())) {
    throw new Error('Fecha inválida');
  }

  return parsed;
};

/**
 * Formatear fecha a string ISO (solo fecha, sin hora)
 * @param date Objeto Date
 * @returns String en formato YYYY-MM-DD
 */
export const formatDateOnly = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Obtener inicio del mes
 * @param date Fecha de referencia
 * @returns Fecha del primer día del mes
 */
export const getStartOfMonth = (date: Date = new Date()): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

/**
 * Obtener fin del mes
 * @param date Fecha de referencia
 * @returns Fecha del último día del mes
 */
export const getEndOfMonth = (date: Date = new Date()): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

/**
 * Obtener nombre del mes en español
 * @param monthNumber Número del mes (0-11)
 * @returns Nombre del mes
 */
export const getMonthName = (monthNumber: number): string => {
  const months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  return months[monthNumber] || 'Desconocido';
};

/**
 * Sanitizar string eliminando espacios extra
 * @param text Texto a sanitizar
 * @returns Texto sanitizado
 */
export const sanitizeText = (text: string): string => {
  return text.trim().replace(/\s+/g, ' ');
};

/**
 * Generar slug desde un texto
 * @param text Texto a convertir
 * @returns Slug generado
 */
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Calcular edad desde fecha de nacimiento
 * @param birthDate Fecha de nacimiento
 * @returns Edad en años
 */
export const calculateAge = (birthDate: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

/**
 * Validar que un número esté en un rango
 * @param value Valor a validar
 * @param min Valor mínimo
 * @param max Valor máximo
 * @returns true si está en el rango
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

/**
 * Truncar texto a una longitud máxima
 * @param text Texto a truncar
 * @param maxLength Longitud máxima
 * @param suffix Sufijo a agregar (por defecto '...')
 * @returns Texto truncado
 */
export const truncateText = (
  text: string,
  maxLength: number,
  suffix: string = '...'
): string => {
  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Delay asíncrono (útil para rate limiting o testing)
 * @param ms Milisegundos a esperar
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Generar un ID aleatorio
 * @param length Longitud del ID
 * @returns ID aleatorio
 */
export const generateRandomId = (length: number = 16): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};