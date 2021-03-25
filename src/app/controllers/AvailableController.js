import {
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
  setSeconds,
  format,
  isAfter,
} from 'date-fns';

import { Op } from 'sequelize';

import Appointment from '../models/Appointment';

class AvailableController {
  async index(req, res) {
    const { date } = req.query;

    // Verificamos se essa data existe
    if (!date) {
      return res.status(400).json({ error: 'Data inválida' });
    }

    // Preciso transformar essa data para um numero inteiro
    const searchDate = Number(date);

    const appointments = await Appointment.finddAll({
      where: {
        provider_id: req.params.providerId,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
        },
      },
    });

    // Os horários disponiveis de um fornecedor
    const schedule = [
      '08:00',
      '09:00',
      '10:00',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00',
      '18:00',
    ];

    // Vai retornar as datas disponíveis
    const avilable = schedule.map((time) => {
      // Fazendo uma desestruturação para pegar separado a hora e o minuto
      const [hour, minute] = time.split(':');
      const value = setSeconds(
        setMinutes(setHours(searchDate, hour), minute),
        0
      );
      return {
        time,
        value: format(value, "yyyy-MM-dd'T'HH:mm:ssxxx"),
        avilable:
          isAfter(value, new Date()) &&
          !appointments.find(
            (appointment) => format(appointment.date, 'HH:mm') === time
          ),
        // Verificamos se há algum agendamente marcado nesses horários
      };
    });

    return res.json(avilable);
  }
}

export default new AvailableController();
