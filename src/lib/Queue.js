// Configurando nossa Fila de Jobs
import Bee from 'bee-queue';

import CancellationMail from '../app/jobs/CancellationMail';

import redisConfig from '../config/redis';

const jobs = [CancellationMail];

class Queue {
  constructor() {
    // Todos os nossos jobs ficarão armazenados nessa variavel this.queues
    // onde armazenamos nossa fila que contem nossa conexão com o banco não relacional redis
    // e tambem armazenamos o método handle que vai executar no job toda vez que for chamado
    this.queues = {};

    this.init();
  }

  init() {
    // vamos percorrer nosso jobs buscando o jobs necessário
    // jobs.forEach(job => { Podemos fazer a desestruturação para acessar mais rapido as informações de jobs7
    jobs.forEach(({ key, handle }) => {
      this.queues[key] = {
        bee: new Bee(key, {
          redis: redisConfig,
        }),
        handle, // << Que vem do nosso job (processa nossas variáveis)
      };
    });
  }

  // Metodo para adicionar novos Jobs na nossa fila
  // Passamos nosso CancellationMail como primeiro parâmetro
  // e como segundo nosso job todas as informações sobre os appointments
  add(queue, job) {
    return this.queues[queue].bee.createJob(job).save();
  }

  // Criando nossos processos sua função é pegar esses jobs e ficar processando eles em tempo real
  // Toda vez que criamos um novo job com o "add" o process entra em ação executando o job em segundo plano
  processQueue() {
    jobs.forEach((job) => {
      const { bee, handle } = this.queues[job.key];

      bee.on('failed', this.handleFaillure).process(handle);
    });
  }

  // Tratando erros na nossa fila
  handleFaillure(job, err) {
    console.log(`Queue ${job.queue.name}: FAILED`, err);
  }
}
export default new Queue();
