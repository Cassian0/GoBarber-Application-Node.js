// Criamos outro arquivo porque nossa aplicação não vai rodar junto
// com nossa fila assim nossa fila e nossa aplicação são independentes
// posso rodar miha fila em outro servidor sem interferir no desempenho da aplicação
import 'dotenv/config';

import Queue from './lib/Queue';

Queue.processQueue();
