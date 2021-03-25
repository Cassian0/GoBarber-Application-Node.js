// Middlewares responsaveis pela validação do usuário se ele é um usuário válido se está autenticado
import jwt from 'jsonwebtoken';

import { promisify } from 'util';

// Precisamos pegar nosso segredo do token nossa regra para podermos fazer a verificação
import authConfig from '../../config/auth';

export default async (req, res, next) => {
  // Armazenamos o header authorization que vem da nossa requisição que é o
  // nosso token em uma variavel para fazermos a verificação do usuário se ele é válido
  const authHeader = req.headers.authorization;
  // Fazemos a verificação se não ouver token autorizado devolvemos uma msg de erro
  if (!authHeader) {
    return res.status(401).json({ erro: 'Token não foi fornecido' });
  }

  // Aqui estamos fazendo uma desestruturação onde nosso token vem em duas etapas
  // o baerer um espaço e nosso token criptografado aqui então podemos usar o split
  // na nossa variável authHeader para separa-la em duas partes antes e depois do espaço
  // como declarado abaixo assim se tornando um array como sabemos nossa primeira posição
  // é o barear porem só queremos nosso token ai que entra a desestruturação eliminamos
  // o bearer e armazenamos somente nosso token
  const [, token] = authHeader.split(' ');

  try {
    // Utilizamos o promisify para não utilizarmos o callback porem precisamos do async await
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);

    // Armazenamos o id do usuário na nossa requisição userId para podermos
    // utiliza-la na no UserCOntroller para a alteração do nosso usuário
    req.userId = decoded.id;

    return next();
  } catch (err) {
    res.status(401).json({ erro: 'Token inválido' });
  }
};
