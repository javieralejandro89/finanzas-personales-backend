import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  getSessions,
  deleteSession,
} from '../controllers/authController';
import { authenticate } from '../middlewares/auth';
import { runValidations } from '../middlewares/validation';
import { asyncHandler } from '../middlewares/errorHandler';
import {
  registerValidation,
  loginValidation,
  refreshTokenValidation,
  logoutValidation,
  updateProfileValidation,
  changePasswordValidation,
  deleteSessionValidation,
} from '../validators/authValidators';

const router = Router();

/**
 * POST /api/auth/register
 * Registrar nuevo usuario
 * Público
 */
router.post(
  '/register',
  runValidations(registerValidation),
  asyncHandler(register)
);

/**
 * POST /api/auth/login
 * Iniciar sesión
 * Público
 */
router.post(
  '/login',
  runValidations(loginValidation),
  asyncHandler(login)
);

/**
 * POST /api/auth/refresh
 * Refrescar access token
 * Público
 */
router.post(
  '/refresh',
  runValidations(refreshTokenValidation),
  asyncHandler(refreshToken)
);

/**
 * POST /api/auth/logout
 * Cerrar sesión (eliminar refresh token)
 * Público
 */
router.post(
  '/logout',
  runValidations(logoutValidation),
  asyncHandler(logout)
);

/**
 * GET /api/auth/profile
 * Obtener perfil del usuario autenticado
 * Privado
 */
router.get(
  '/profile',
  authenticate,
  asyncHandler(getProfile)
);

/**
 * PATCH /api/auth/profile
 * Actualizar perfil del usuario autenticado
 * Privado
 */
router.patch(
  '/profile',
  authenticate,
  runValidations(updateProfileValidation),
  asyncHandler(updateProfile)
);

/**
 * POST /api/auth/change-password
 * Cambiar contraseña del usuario
 * Privado
 */
router.post(
  '/change-password',
  authenticate,
  runValidations(changePasswordValidation),
  asyncHandler(changePassword)
);

/**
 * GET /api/auth/sessions
 * Obtener todas las sesiones activas
 * Privado
 */
router.get(
  '/sessions',
  authenticate,
  asyncHandler(getSessions)
);

/**
 * DELETE /api/auth/sessions/:sessionId
 * Eliminar una sesión específica
 * Privado
 */
router.delete(
  '/sessions/:sessionId',
  authenticate,
  runValidations(deleteSessionValidation),
  asyncHandler(deleteSession)
);

export default router;