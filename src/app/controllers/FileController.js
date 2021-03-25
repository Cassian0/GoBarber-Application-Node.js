// capturar as informações da imagem do usuário pelo req.file e armazena-las no banco de dados
import File from '../models/File';

class FileController {
  async store(req, res) {
    // Fazemos uma desestruturação para pegar da nossa requisição de file
    // somente o originalname que passamos para nossa banco como name
    // e o filename que no nosso banco é o path
    const { originalname: name, filename: path } = req.file;

    const file = await File.create({
      name,
      path,
    });
    return res.json(file);
  }
}
export default new FileController();
