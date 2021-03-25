import Sequelize, { Model } from 'sequelize';

import { isBefore, subHours } from 'date-fns';

class Appointment extends Model {
  static init(sequelize) {
    super.init(
      {
        date: Sequelize.DATE,
        canceled_at: Sequelize.DATE,
        // Campo virtual para o front de agendamentos passados
        past: {
          type: Sequelize.VIRTUAL,
          get() {
            // True se o horário ja passou do atual false se não passou
            return isBefore(this.date, new Date());
          },
        },
        // Se o agendamento é cancelavel ou não ou seja
        // Se o agendamento está sendo cancelado com duas horas de antecedencia
        cancelable: {
          type: Sequelize.VIRTUAL,
          get() {
            // Pegando a hora atual diminuindo dois para verificar se fica antes da hora agendada
            return isBefore(new Date(), subHours(this.date, 2));
          },
        },
      },
      {
        sequelize,
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    this.belongsTo(models.User, { foreignKey: 'provider_id', as: 'provider' });
  }
}

export default Appointment;
