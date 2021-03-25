// Esse arquivo sera responsavel pela conexão com o banco de dados
// e carregar os nossos models
import Sequelize from 'sequelize'; // << Responsável pela conexão com banco

import mongoose from 'mongoose'; // Nossa conexão com o mongoDB

import User from '../app/models/User'; // <<Importamos nosso user

import File from '../app/models/File'; // Importamos nosso File

import Appointment from '../app/models/Appointment'; // Importamos nosso Appointment

import databaseConfig from '../config/database'; // <<Passamos nossa configuração do banco

const models = [User, File, Appointment];

class Database {
  constructor() {
    this.init();
    this.mongo();
  }

  // Fazer a conexão com a nossa base de dados e carregar os nossos models
  init() {
    this.connection = new Sequelize(databaseConfig); // <<Nossa conexão com a base de dados/ junto com nossa configuração
    // Vou percorrer o array models retornando nosso model para acessar o init nossa conexão
    models
      .map((model) => model.init(this.connection))
      .map(
        // Aqui faremos outra busca em model mas agora só nos models que temos o metodo associate
        (model) => model.associate && model.associate(this.connection.models)
      );
  }

  mongo() {
    this.mongoConnection = mongoose.connect(
      process.env.MONGO_URL, // Criando nosso caminho para o banco criando nossa conexão
      {
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
      }
    );
  }
}

export default new Database();
