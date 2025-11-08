import { PrismaClient } from '@prisma/client';

/**
 * Cliente Prisma singleton para evitar múltiples instancias
 * en desarrollo con hot-reload
 */
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

/**
 * Cerrar conexión de Prisma en caso de shutdown
 */
export const disconnectPrisma = async (): Promise<void> => {
  await prisma.$disconnect();
};