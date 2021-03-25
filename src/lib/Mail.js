// Configrações do nosso envio de email
import nodemailer from 'nodemailer';

import expressHandle from 'express-handlebars';

import nodemailerHandle from 'nodemailer-express-handlebars';

import { resolve } from 'path';

import mailConfig from '../config/mail';

class Mail {
  constructor() {
    // Desestruturando o mailConfig
    const { host, port, secure, auth } = mailConfig;

    // Que como o nodemailer chama uma conexão de servico externo para envio de email
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: auth.user ? auth : null, // Verificamos se há um usuário se não sera passado como nulo
    });

    this.configureTemplates();
  }

  configureTemplates() {
    const viewPath = resolve(__dirname, '..', 'app', 'views', 'emails');

    // Compile >> como compila nossos endereços de email como irá formatar nossa mensagem

    this.transporter.use(
      'compile',
      nodemailerHandle({
        viewEngine: expressHandle.create({
          layoutsDir: resolve(viewPath, 'layouts'), // caminho até nossa pasta layout
          partialsDir: resolve(viewPath, 'partials'), // caminho até nossa pasta partials
          defaultLayout: 'default',
          extname: '.hbs', // extensão dos nosso arquivos de formatação
        }),
        viewPath,
        extName: '.hbs',
      })
    );
  }

  sendMail(message) {
    return this.transporter.sendMail({
      ...mailConfig.default, // Vamos passar tudo que está em default
      ...message, // e tudo que vem da mensagem no nosso email
    });
  }
}
export default new Mail();
