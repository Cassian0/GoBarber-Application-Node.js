require('dotenv/config');

module.exports = {
  dialect: 'postgres',
  host: process.env.DB_HOST,
  username: process.env.USER,
  password: process.env.PASS,
  database: process.env.NAME,
  define: {
    timestamps: true, // registrar datas de criação e alteração de tabelas
    underscored: true, // Padrão de nomeclatura de tabelas underscored sem ser o padrão camelCase
    underscoredAll: true,
  },
};
