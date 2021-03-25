// Contem as configurações da parte de autenticação da nossa aplicação
export default {
  secret: process.env.APP_SECRET,
  expiresIn: '7d',
};
