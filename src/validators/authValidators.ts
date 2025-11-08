import { body, param } from 'express-validator';
import { VALIDATION, SUPPORTED_CURRENCIES } from '../config/constants';

/**
 * Validaciones para registro
 */
export const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: VALIDATION.NAME_MIN_LENGTH, max: VALIDATION.NAME_MAX_LENGTH })
    .withMessage(
      `El nombre debe tener entre ${VALIDATION.NAME_MIN_LENGTH} y ${VALIDATION.NAME_MAX_LENGTH} caracteres`
    ),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es requerido')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail()
    .isLength({ max: VALIDATION.EMAIL_MAX_LENGTH })
    .withMessage(`El email no puede exceder ${VALIDATION.EMAIL_MAX_LENGTH} caracteres`),

  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({
      min: VALIDATION.PASSWORD_MIN_LENGTH,
      max: VALIDATION.PASSWORD_MAX_LENGTH,
    })
    .withMessage(
      `La contraseña debe tener entre ${VALIDATION.PASSWORD_MIN_LENGTH} y ${VALIDATION.PASSWORD_MAX_LENGTH} caracteres`
    )
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    ),

  body('currency')
    .optional()
    .isIn(SUPPORTED_CURRENCIES)
    .withMessage(`Moneda no soportada. Opciones: ${SUPPORTED_CURRENCIES.join(', ')}`),
];

/**
 * Validaciones para login
 */
export const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es requerido')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),

  body('password').notEmpty().withMessage('La contraseña es requerida'),
];

/**
 * Validaciones para refresh token
 */
export const refreshTokenValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token es requerido')
    .isString()
    .withMessage('Refresh token debe ser un string'),
];

/**
 * Validaciones para logout
 */
export const logoutValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token es requerido')
    .isString()
    .withMessage('Refresh token debe ser un string'),
];

/**
 * Validaciones para actualizar perfil
 */
export const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El nombre no puede estar vacío')
    .isLength({ min: VALIDATION.NAME_MIN_LENGTH, max: VALIDATION.NAME_MAX_LENGTH })
    .withMessage(
      `El nombre debe tener entre ${VALIDATION.NAME_MIN_LENGTH} y ${VALIDATION.NAME_MAX_LENGTH} caracteres`
    ),

  body('currency')
    .optional()
    .isIn(SUPPORTED_CURRENCIES)
    .withMessage(`Moneda no soportada. Opciones: ${SUPPORTED_CURRENCIES.join(', ')}`),
];

/**
 * Validaciones para cambiar contraseña
 */
export const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('La contraseña actual es requerida'),

  body('newPassword')
    .notEmpty()
    .withMessage('La nueva contraseña es requerida')
    .isLength({
      min: VALIDATION.PASSWORD_MIN_LENGTH,
      max: VALIDATION.PASSWORD_MAX_LENGTH,
    })
    .withMessage(
      `La contraseña debe tener entre ${VALIDATION.PASSWORD_MIN_LENGTH} y ${VALIDATION.PASSWORD_MAX_LENGTH} caracteres`
    )
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    )
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('La nueva contraseña debe ser diferente a la actual');
      }
      return true;
    }),

  body('refreshToken')
    .optional()
    .isString()
    .withMessage('Refresh token debe ser un string'),
];

/**
 * Validaciones para eliminar sesión
 */
export const deleteSessionValidation = [
  param('sessionId')
    .notEmpty()
    .withMessage('ID de sesión es requerido')
    .isUUID()
    .withMessage('ID de sesión inválido'),
];