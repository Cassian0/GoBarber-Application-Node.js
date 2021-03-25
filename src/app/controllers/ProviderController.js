import User from '../models/User';

import File from '../models/File';

class ProviderController {
  async index(req, res) {
    // Buscamos nosso provider em user porem com findAll vamos puchar todos os usuario
    // então usamos uma condicional queremos somente os usuarios que tiverem provider
    // igual a true alem de retornar só alguns atributos como id, name, email, avatar_id
    const provider = await User.findAll({
      where: { provider: true },
      attributes: ['id', 'name', 'email', 'avatar_id'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ], // Incluimos tambem todos os dados do file ao respectivo provider
    });

    return res.json(provider);
  }
}

export default new ProviderController();
