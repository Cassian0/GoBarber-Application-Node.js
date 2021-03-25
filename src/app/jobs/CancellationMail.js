// Job seria os trabalhos em segunda plano como enviar email de cancelamento
import { format } from 'date-fns';

import pt from 'date-fns/locale/pt';

import Mail from '../../lib/Mail';

class CancellationMail {
  // Para cada Job precisaremos de uma chave unica
  get key() {
    return 'CancellationMail';
  }

  // Tarefa que sera executada quando esse processo for chamado
  // Será chamado para o envio de cada email
  // Data serão as informações que serão recebidas para preenchimento das informações do email
  async handle(data) {
    const { appointment } = data;

    console.log('A fila executou');

    await Mail.sendMail({
      to: `${appointment.provider.name} < ${appointment.provider.email}>`,
      subject: 'Agendamento cancelado',
      template: 'Cancellation', // <<"Body" indicando o template a ser usado que no nosso caso é o cancellation.hbs
      context: {
        // Atribuindo valores a nossas variáveis declaradas no default.hbs/ footer.hbs e cance...
        provider: appointment.provider.name,
        user: appointment.user.name,
        date: format(appointment.date, "'dia' dd 'de' MMMM', às' H:mm'h'", {
          locale: pt,
        }),
      },
    });
  }
}

export default new CancellationMail();
