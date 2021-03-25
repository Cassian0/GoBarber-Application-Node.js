// Aqui vai ficar toda a nossa configuração da parte de uploads de arquivos
import multer from 'multer';

import crypto from 'crypto';
// extname>> retorna a extensão de um arquivo baseado no nome de uma imagem ou arquivo
// resolve>> percorrer um caminho dentro da aplicação
import { extname, resolve } from 'path';

export default {
  // Usamos o starage para especificar qual o local que nosso arquivo vai ficar armazenado
  storage: multer.diskStorage({
    destination: resolve(__dirname, '..', '..', 'temp', 'uploads'), // o caminho de onde vamos armazenar nossos arquivos
    filename: (req, file, cb) => {
      // Aqui vamos formatar o nome de arquivo da nossa imagem para que ela seja unica
      // Gerar caracteresa aleatorios
      crypto.randomBytes(16, (err, res) => {
        // Caso ocorra algum erro retornamos ele com o cb "callback"
        if (err) return cb(err);
        // Se não der erro vamos retornar o nome do nosso arquivo
        // passando null como primeiro parametro pois o erro já passamos anteriormente
        // por fim transformamos nossa resposta(res) de bytes em hexadecimal e
        // concatenamos com extensão do nosso arquivo
        return cb(null, res.toString('hex') + extname(file.originalname));
      });
    },
  }),
};
