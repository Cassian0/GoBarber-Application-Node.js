import * as Yup from 'yup';
import User from '../models/User';

class UserController {
  async store(req, res) {
    // Vamos validar os campos da nossa requisicao(req)
    const schema = Yup.object().shape({
      name: Yup.string().required(), // Campo nome string obrigatório
      email: Yup.string().email().required(), // Campo email verificando os caracteres especias do email e é obrigatório
      password: Yup.string().required().min(6), // Campo senha string obrigatório e minino de 6 caracteres
    });

    // Verificamos se os campos conferem com a regra passada a cima se for falso por isso a negação
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validação falhou' });
    }

    // Verificando se ja tem um email cadastrado na base de dados que seja igual
    const userExists = await User.findOne({ where: { email: req.body.email } });
    // Procure um email no User quando email for igual a email da requisição
    if (userExists) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }
    const { id, name, email, provider } = await User.create(req.body);

    return res.json({
      id,
      name,
      email,
      provider,
    });
  }

  async update(req, res) {
    // Mesma verificação dos campos quando for alterar um usuário
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      // Aqui verificamos se o usuario passou um oldPassword e executamos uma função
      // como parametro oldPassword senha antiga com o field que é a nova senha
      // Usamos para verificação um operador ternário se oldPassword então field.required
      // é true ou seja precisamos de uma nova senha já que a antiga foi passada
      // se não retorno o field da forma que ja estava sem alteração
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
      // Precisamos confirmar se a nova senha é valida se foi passado um password
      // por isso comparamos com o campo password através do oneOF e referenciando com
      // o Yup.ref
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validação falhou' });
    }

    // Pegamos as informações do nosso usuário
    const { email, oldPassword } = req.body;
    // Procuramso nosso usuário pela Id passada pelo token
    const user = await User.findByPk(req.userId);
    // Verificamos se o email que ele está passando é diferente do que ja está cadastrado
    if (email !== user.email) {
      // Precisamos verificas também se o novo email que ele está tentando cadastrar ja não está cadastrado
      const userExists = await User.findOne({ where: { email } });
      if (userExists) {
        return res.status(401).json({ error: 'Usuário já existe' });
      }
    }
    // Então verificamos se ele passou um password e se ele é diferente com o que já temos cadastrado
    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Senha não confere ' });
    }
    const { id, name, provider } = await user.update(req.body);

    return res.json({
      id,
      name,
      email,
      provider,
    });
  }
}
export default new UserController();
