/** Listar agendamentos especificos para fornecedores
 * ou seja aquela página exclusiva para exibição de agendamentos
 */
import { startOfDay, endOfDay, parseISO } from 'date-fns';

import { Op } from 'sequelize'; // para podermos utilizar operadores como o between

import Appointment from '../models/Appointment';

import User from '../models/User';

class ScheduleController {
  async index(req, res) {
    // Armazenamos o fornecedor requisitado em uma variavel para ver se existe
    const checkUserProvider = await User.findOne({
      where: { id: req.userId, provider: true },
    });
    // Verificamos se é um fornecedor válido
    if (!checkUserProvider) {
      return res.status(401).json({ error: 'Usuário não é um fornecedor' });
    }
    const { date } = req.query;
    const parsedDate = parseISO(date);

    // Para listar todos os agendamentos
    const appointments = Appointment.findAll({
      where: {
        provider_id: req.userId, // Verificamos se o id da requisição bate com o de um fornecedor
        canceled_at: null,
        date: {
          // Verificamos se a data está entre o incio do dia e o final do mesmo dia
          [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
        },
      },
      order: ['date'], // Ordenar por data
    });

    return res.json(appointments);
  }
}

export default new ScheduleController();
