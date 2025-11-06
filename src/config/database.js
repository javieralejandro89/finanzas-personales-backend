const { Sequelize } = require('sequelize');

// Configuración con SQLite para desarrollo fácil
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite', // Archivo de base de datos SQLite
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true
  }
});

// Alternativa con PostgreSQL (comentado por ahora)
// const sequelize = new Sequelize(
//   process.env.DB_NAME || 'finanzas_db',
//   process.env.DB_USER || 'postgres',
//   process.env.DB_PASSWORD || 'password',
//   {
//     host: process.env.DB_HOST || 'localhost',
//     port: process.env.DB_PORT || 5432,
//     dialect: 'postgres',
//     logging: process.env.NODE_ENV === 'development' ? console.log : false,
//     pool: {
//       max: 5,
//       min: 0,
//       acquire: 30000,
//       idle: 10000
//     },
//     define: {
//       timestamps: true,
//       createdAt: 'created_at',
//       updatedAt: 'updated_at',
//       underscored: true
//     }
//   }
// );

module.exports = { sequelize };