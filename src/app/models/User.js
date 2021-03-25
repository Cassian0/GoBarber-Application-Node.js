// Controle do nosso usuário como criar, deletar manipulação do nosso usuário
import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcryptjs';

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        // Primeiro parametro um objeto com todos os valores que o usuário vai preencher receber
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        password: Sequelize.VIRTUAL, //  <<Virtual quer dizer que ele é um campo que nunca vai existir na base de dados apenas nesse lado do código
        password_hash: Sequelize.STRING,
        provider: Sequelize.BOOLEAN,
      },
      {
        // Segundo parametro passamos outro objeto o sequelize
        sequelize,
      }
    );
    // Antes de um usuário ser salvo no banco de dados esse trecho de codigo vai ser executado automaticamente
    this.addHook('beforeSave', async (user) => {
      // <<Se é um novo usuario ou seja uma nova senha
      if (user.password) {
        // Se for um novo passwaord vamos criptografar o password_hard que é o campo salvo no banco
        // usando o bcrypt_hash(criptografando) e o campo virtual o password junto com a qauntidade de
        // caracteres como parametro sendo que é armazenaremos na variavel password_hash nosso campo do banco
        user.password_hash = await bcrypt.hash(user.password, 8);
      }
    });
    return this; // Para retornar sempre o model que foi inicializado
  }

  // Criando nosso relacionamento entre a tabela users com a tabela files
  static associate(models) {
    // Esta entidade pertence a models.file e a referencia entre elas é "avatar_id"
    this.belongsTo(models.File, { foreignKey: 'avatar_id', as: 'avatar' }); // passando um codinome 'avatar para nosso file
  }

  // Checamos o password passado no parametro
  checkPassword(password) {
    // Verificamos com o campare do bcrypt se o password passado pelo usuário
    // é o mesmo armazenado no banco pela variavel password_hash retornando true ou false
    return bcrypt.compare(password, this.password_hash);
  }
}
export default User;
