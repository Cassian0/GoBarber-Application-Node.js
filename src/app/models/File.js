import Sequelize, { Model } from 'sequelize';

class File extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        path: Sequelize.STRING,
        // Passamos um campo virtual para nosso front conseguir acessar a imagem
        url: {
          type: Sequelize.VIRTUAL,
          get() {
            // para passarmos a localização da nossa imagem salva no banco
            return `${process.env.APP_URL}/files/${this.path}`;
          },
        },
      },
      {
        sequelize,
      }
    );
    return this;
  }
}
export default File;
