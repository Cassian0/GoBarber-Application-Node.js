import * as Yup from 'yup';

import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';

import pt from 'date-fns/locale/pt'; // Importando a data local no caso Brasil

import Appointment from '../models/Appointment';

import File from '../models/File';

import User from '../models/User';

import Notifications from '../schemas/Notifications';

import CancellationMail from '../jobs/CancellationMail';

import Queue from '../../lib/Queue';

class AppointmentController {
  async index(req, res) {
    // Aqui pro padrão nosso usuário vai estar na página caso nenhuma seja informada
    const { page = 1 } = req.query;

    // buscando agendamentos
    const appointments = await Appointment.findAll({
      where: {
        user_id: req.userId, // apenas aqueles encontrados na requisição ou seja com o token
        canceled_at: null, // e apenas aqueles que estiverem ativos
      },
      order: ['date'], // Ordenar os agendamentos por data
      attributes: ['id', 'date', 'past', 'cancelable'], // trazendo do agendamento apenas o id e data
      limit: 20, // limite de listagem de agendamentos
      offset: (page - 1) * 20, // Definindo quantos registros vamos pular por pagina
      include: [
        {
          model: User, // alem de incluir o relacionamento com o fornecedor
          as: 'provider', // preciso definir qual é por ter dois relacionamentos de tabelas em agendamentos
          attributes: ['id', 'name'], // trazendo apenas o id e o nome do fornecedor
          include: [
            {
              model: File, // Vamos incluir também o avatar do nosso usuário para ser apresentado
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });
    return res.json(appointments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validação falhou!' });
    }
    const { provider_id, date } = req.body;
    // Vamos verificar se o provider_id corresponde a um provider
    const checkIsProvider = await User.findOne({
      // Buscamos um na lista pelo provider_id e que seu status seja verdadeiro
      where: { id: provider_id, provider: true },
    });

    // const { userId } = req;

    if (req.userId === provider_id) {
      return res.status(401).json({ error: 'Não pode agendar com você mesmo' });
    }

    // Se retornar falso
    if (!checkIsProvider) {
      return res
        .status(401)
        .json({ error: 'Você só pode criar agendamentos sendo fornecedor' });
    }

    // Com o startOfHour pegamos só a hora cheia e o parseISO converte ela para hora para usarmos no startOfHour
    const hourStart = startOfHour(parseISO(date));

    // Verificamos se o hourstart está antes de new Date
    // ou seja se é uma data antiga da que estamos no presente
    if (isBefore(hourStart, new Date())) {
      return res
        .status(400)
        .json({ error: 'Datas passadas não são permitidas' });
    }
    // Verificamos se há data solicitada está disponivel se está vaga
    const checkDateProvider = await Appointment.findOne({
      where: {
        provider_id, // Se o id do fornecedor é o mesmo solicitado
        canceled_at: null, // Se é uma data valida que não está cancelada
        date: hourStart,
      },
    });
    // Se encontrou uma data quer dizer que não está disponivel
    if (checkDateProvider) {
      return res
        .status(400)
        .json({ error: 'A data do agendamento não é válida' });
    }

    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date: hourStart, // Para que não sejam salvas datas quebradas apenas de hora em hora
    });

    // Encontrarmos o user para mandar a notificação
    const user = await User.findByPk(req.userId);

    // Formatando nossa data
    const formatted = format(
      hourStart,
      // Ex: dia 22 de março, às 08:21h como será o formato da hora
      "'dia' dd 'de' MMMM', às' H:mm'h'",
      { locale: pt }
    );

    // Criar uma notificação para o prestador de serviço

    await Notifications.create({
      content: `Novo agendamento de ${user.name} para o ${formatted}`,
      user: provider_id,
    });

    return res.json(appointment);
  }

  async delete(req, res) {
    // Fazemos um include com provider para conseguirmos pegar o nome e email para o envio da mensagem
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
    });

    if (appointment.canceled_at !== null) {
      return res.status(400).json({ error: 'Agendamento já foi excluido' });
    }

    // Verificamos se o usuário que está tentando deletar é o mesmo do agendamento
    if (appointment.user_id !== req.userId) {
      return res
        .status(401)
        .json({ error: 'Não tem permissão para cancelar esse agendamento' });
    }
    // Aqui retiramos duas horas do horario atual do cancelamento para verificar se não passou
    // da hora em que foi agendado com o fornecedor, ou seja se foi cacelado duas horas antes o agendamento
    const subHour = subHours(appointment.date, 2);

    if (isBefore(subHour, new Date())) {
      return res
        .status(401)
        .json({ error: 'Você só pode cancelar agendamentos duas horas antes' });
    }

    // Se deu tudo certo vamos alterar a data de cancelamento la do nosso banco
    appointment.canceled_at = new Date();

    await appointment.save();

    // Depois de salvar os agendamentos vamos enviar um email
    await Queue.add(CancellationMail.key, {
      appointment,
    });

    return res.json(appointment);
  }
}

export default new AppointmentController();
