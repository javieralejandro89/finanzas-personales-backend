import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { prisma } from '../config/prisma';
import {
  hashPassword,
  comparePassword,
  sanitizeText,
} from '../utils/validators';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  calculateExpirationDate,
} from '../utils/jwt';
import {
  AppError,
  createUnauthorizedError,
  createConflictError,
  createNotFoundError,
} from '../middlewares/errorHandler';
import { CONFIG, ERROR_MESSAGES, HTTP_STATUS } from '../config/constants';

/**
 * Registrar nuevo usuario
 */
export const register = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { name, email, password, currency } = req.body;

  // Verificar si el email ya existe
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    throw createConflictError(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
  }

  // Hash de la contraseña
  const hashedPassword = await hashPassword(password);

  // Crear usuario
  const user = await prisma.user.create({
    data: {
      name: sanitizeText(name),
      email: email.toLowerCase(),
      password: hashedPassword,
      currency: currency || CONFIG.DEFAULT_CURRENCY,
    },
    select: {
      id: true,
      name: true,
      email: true,
      currency: true,
      createdAt: true,
    },
  });

  // Crear sesión
  const userAgent = req.headers['user-agent'];
  const ipAddress = req.ip || req.socket.remoteAddress;

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      refreshToken: 'temp', // Se actualizará después
      userAgent,
      ipAddress,
      expiresAt: calculateExpirationDate(CONFIG.JWT_REFRESH_EXPIRES_IN),
    },
  });

  // Generar tokens
  const accessToken = generateAccessToken(user.id, user.email);
  const refreshToken = generateRefreshToken(user.id, session.id);

  // Actualizar sesión con el refresh token real
  await prisma.session.update({
    where: { id: session.id },
    data: { refreshToken },
  });

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Usuario registrado exitosamente',
    data: {
      user,
      tokens: {
        accessToken,
        refreshToken,
      },
    },
  });
};

/**
 * Login de usuario
 */
export const login = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { email, password } = req.body;

  // Buscar usuario
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    throw createUnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);
  }

  // Verificar contraseña
  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw createUnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);
  }

  // Verificar que el usuario esté activo
  if (!user.isActive) {
    throw createUnauthorizedError('Usuario inactivo');
  }

  // Crear sesión
  const userAgent = req.headers['user-agent'];
  const ipAddress = req.ip || req.socket.remoteAddress;

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      refreshToken: 'temp',
      userAgent,
      ipAddress,
      expiresAt: calculateExpirationDate(CONFIG.JWT_REFRESH_EXPIRES_IN),
    },
  });

  // Generar tokens
  const accessToken = generateAccessToken(user.id, user.email);
  const refreshToken = generateRefreshToken(user.id, session.id);

  // Actualizar sesión con el refresh token real
  await prisma.session.update({
    where: { id: session.id },
    data: { refreshToken },
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Login exitoso',
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        currency: user.currency,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    },
  });
};

/**
 * Refrescar access token usando refresh token
 */
export const refreshToken = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { refreshToken: token } = req.body;

  if (!token) {
    throw createUnauthorizedError('Refresh token requerido');
  }

  // Verificar refresh token
  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch (error) {
    throw createUnauthorizedError(
      error instanceof Error ? error.message : ERROR_MESSAGES.TOKEN_INVALID
    );
  }

  // Buscar sesión
  const session = await prisma.session.findUnique({
    where: { id: payload.sessionId },
    include: { user: true },
  });

  if (!session || session.refreshToken !== token) {
    throw createUnauthorizedError(ERROR_MESSAGES.SESSION_NOT_FOUND);
  }

  // Verificar que la sesión no haya expirado
  if (new Date() > session.expiresAt) {
    await prisma.session.delete({ where: { id: session.id } });
    throw createUnauthorizedError('Sesión expirada');
  }

  // Verificar que el usuario esté activo
  if (!session.user.isActive) {
    throw createUnauthorizedError('Usuario inactivo');
  }

  // Generar nuevo access token
  const accessToken = generateAccessToken(session.user.id, session.user.email);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Token refrescado exitosamente',
    data: {
      accessToken,
    },
  });
};

/**
 * Logout - Eliminar sesión actual
 */
export const logout = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { refreshToken: token } = req.body;

  if (!token) {
    throw createUnauthorizedError('Refresh token requerido');
  }

  // Buscar y eliminar sesión
  const session = await prisma.session.findUnique({
    where: { refreshToken: token },
  });

  if (session) {
    await prisma.session.delete({ where: { id: session.id } });
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Logout exitoso',
  });
};

/**
 * Obtener perfil del usuario autenticado
 */
export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw createUnauthorizedError();
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      currency: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw createNotFoundError('Usuario');
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: user,
  });
};

/**
 * Actualizar perfil del usuario
 */
export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw createUnauthorizedError();
  }

  const { name, currency } = req.body;

  const updateData: {
    name?: string;
    currency?: string;
  } = {};

  if (name) {
    updateData.name = sanitizeText(name);
  }

  if (currency) {
    updateData.currency = currency;
  }

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      currency: true,
      updatedAt: true,
    },
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Perfil actualizado exitosamente',
    data: user,
  });
};

/**
 * Cambiar contraseña
 */
export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw createUnauthorizedError();
  }

  const { currentPassword, newPassword } = req.body;

  // Obtener usuario con contraseña
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  if (!user) {
    throw createNotFoundError('Usuario');
  }

  // Verificar contraseña actual
  const isPasswordValid = await comparePassword(currentPassword, user.password);

  if (!isPasswordValid) {
    throw new AppError('Contraseña actual incorrecta', HTTP_STATUS.BAD_REQUEST);
  }

  // Hash de la nueva contraseña
  const hashedPassword = await hashPassword(newPassword);

  // Actualizar contraseña
  await prisma.user.update({
    where: { id: req.user.id },
    data: { password: hashedPassword },
  });

  // Eliminar todas las sesiones excepto la actual
  const { refreshToken: currentToken } = req.body;
  
  await prisma.session.deleteMany({
    where: {
      userId: req.user.id,
      refreshToken: { not: currentToken },
    },
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Contraseña cambiada exitosamente. Otras sesiones han sido cerradas.',
  });
};

/**
 * Obtener todas las sesiones activas del usuario
 */
export const getSessions = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw createUnauthorizedError();
  }

  const sessions = await prisma.session.findMany({
    where: { userId: req.user.id },
    select: {
      id: true,
      userAgent: true,
      ipAddress: true,
      createdAt: true,
      expiresAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: sessions,
  });
};

/**
 * Eliminar una sesión específica
 */
export const deleteSession = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw createUnauthorizedError();
  }

  const { sessionId } = req.params;

  // Verificar que la sesión pertenezca al usuario
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session || session.userId !== req.user.id) {
    throw createNotFoundError('Sesión');
  }

  await prisma.session.delete({ where: { id: sessionId } });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Sesión eliminada exitosamente',
  });
};