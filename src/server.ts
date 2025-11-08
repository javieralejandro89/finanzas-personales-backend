import { createApp } from './app';
import { CONFIG, validateEnv } from './config/constants';
import { disconnectPrisma } from './config/prisma';

/**
 * Iniciar el servidor
 */
const startServer = async (): Promise<void> => {
  try {
    // Validar variables de entorno
    validateEnv();

    // Crear aplicación
    const app = createApp();

    // Iniciar servidor
    const server = app.listen(CONFIG.PORT, () => {
      console.log('🚀 Servidor iniciado correctamente');
      console.log(`📡 Puerto: ${CONFIG.PORT}`);
      console.log(`🌍 Ambiente: ${CONFIG.NODE_ENV}`);
      console.log(`🔗 URL: http://localhost:${CONFIG.PORT}`);
      console.log(`✅ Health check: http://localhost:${CONFIG.PORT}/health`);
    });

    // Manejo de shutdown graceful
    const gracefulShutdown = async (signal: string): Promise<void> => {
      console.log(`\n⚠️  Señal ${signal} recibida. Cerrando servidor...`);

      server.close(async () => {
        console.log('🔒 Servidor cerrado');

        try {
          await disconnectPrisma();
          console.log('🔌 Desconectado de la base de datos');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error al cerrar conexiones:', error);
          process.exit(1);
        }
      });

      // Forzar cierre después de 10 segundos
      setTimeout(() => {
        console.error('⏰ Tiempo de espera agotado. Forzando cierre...');
        process.exit(1);
      }, 10000);
    };

    // Escuchar señales de terminación
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Manejo de errores no capturados
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Promesa rechazada no manejada:', promise, 'razón:', reason);
    });

    process.on('uncaughtException', (error) => {
      console.error('❌ Excepción no capturada:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Iniciar servidor
startServer();