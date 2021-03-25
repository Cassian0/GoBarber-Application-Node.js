import Notification from '../schemas/Notifications';

import User from '../models/User';

class NotificationController {
  async index(req, res) {
    const checkIsProvider = await User.findOne({
      where: { id: req.userId, provider: true },
    });

    if (!checkIsProvider) {
      return res
        .status(401)
        .json({ error: 'Apenas fornecedores podem receber notificações' });
    }

    // Trazendo nossa lista de notificações
    const notifications = await Notification.find({
      user: req.userId, // retornamos o usuário logado
    })
      .sort({ createdAt: 'desc' }) // Ordenamos por data em ordem decrescente do ultimo para o primeiro
      .limit(20); // e o máximo exibido de 20 notificações

    return res.json(notifications);
  }

  async update(req, res) {
    // Buscando a notificação no banco de dados pelo id que vem da requisição
    const notification = await Notification.findByIdAndUpdate(
      req.params.id, /// pegamos o id da notificação pela requisição
      { read: true }, // alteramos ela para lida
      { new: true } // precisamos do new para traze-la alterada do banco para atualizar essa informação
    );

    return res.json(notification);
  }
}

export default new NotificationController();
