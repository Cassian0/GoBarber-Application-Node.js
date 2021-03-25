/*  Estrutura da aplicação */
import 'dotenv/config';

import express from 'express';

import path from 'path';

import Youch from 'youch';

import * as Sentry from '@sentry/node';

import sentryConfig from './config/sentry';

import 'express-async-errors';

import routes from './routes'; // Passando nosso arquivo routes para uma constante

import './database';

class App {
  // toda vez que nossa classe app for chamada sera obrigado a executar o que estiver no constructor
  constructor() {
    this.server = express();

    Sentry.init(sentryConfig);

    // Passando no consrutor para que sejam chamadas na nossa aplicação
    this.middlewares();
    this.routes();
    this.exceptionHandler();
  }

  middlewares() {
    this.server.use(Sentry.Handlers.requestHandler());

    // Possibilita que nossa aplicação receba requisições no formato json
    this.server.use(express.json());
    this.server.use(
      '/files', // Criando o caminho para acessar nossa imagem
      express.static(path.resolve(__dirname, '..', 'temp', 'uploads'))
      // o metodos static do express é usado para imagens, html, css arquivos estáticos
    );
  }

  routes() {
    this.server.use(routes);
    this.server.use(Sentry.Handlers.errorHandler());
  }

  exceptionHandler() {
    // Quando um middleware recebe quatro parametros quer dizer que ele é de tratamento de excessões
    this.server.use(async (err, req, res, next) => {
      if (process.env.NODE_ENV === 'development') {
        const errors = await new Youch(err, req).toJSON();

        return res.status(500).json(errors);
      }
      return res.status(500).json({ error: 'Erro interno' });
    });
  }
}
export default new App().server;
