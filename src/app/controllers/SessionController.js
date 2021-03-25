import jwt from 'jsonwebtoken';

import * as Yup from 'yup';

import User from '../models/User';

import authConfig from '../../config/auth';

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string().email(),
      password: Yup.string().required(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validação falhou' });
    }
    // Precisamos pegar da requisição o email e password do usuario para verificações
    const { email, password } = req.body;
    // buscamos se há um email existente
    const user = await User.findOne({ where: { email } });
    // Se não existe o usuário
    if (!user) {
      return res.status(401).json({ erro: 'Usuário não encontrado' });
    }
    // Verificamos se a senha passada pelo o usuário é valida
    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'Senha não confere' });
    }
    // Se passou pela verificação pegamos o nome e id do usuário e o email tambem informado la em cima
    const { id, name } = user;

    return res.json({
      user: {
        id,
        name,
        email,
      },
      // Gerando nosso token passamos o id para poder utilizar para manipulação do usuário
      // Segundo parametro é uma string de token aleatorio no site md5online
      // Como terceiro parametro passamos configurações do jwt
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn, // Tempo de expiração do nosso token
      }),
    });
  }
}
export default new SessionController();
