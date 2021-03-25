import { Router } from 'express';

import multer from 'multer';

import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';

import ProviderController from './app/controllers/ProviderController';

import SessionController from './app/controllers/SessionController';

import FileController from './app/controllers/FileController';

import AppointmentController from './app/controllers/AppointmentController';

import ScheduleController from './app/controllers/ScheduleController';

import NotificationController from './app/controllers/NotificationController';

import AvailableController from './app/controllers/AvailableController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

// Definindo a autentificação do token após o post aonde ele é gerado ele será
// utilizado nas rotas seguintes que vierem abaixo dele assim todas elas
// precisarão de um token valido para serem acessadas
routes.use(authMiddleware);

routes.put('/users', UserController.update);

routes.get('/providers', ProviderController.index);
routes.get('/providers/:providerId/available', AvailableController.index);

routes.get('/appointments', AppointmentController.index);
routes.post('/appointments', AppointmentController.store);
routes.delete('/appointments/:id', AppointmentController.delete);

routes.get('/schedule', ScheduleController.index);

routes.get('/notification', NotificationController.index);
routes.put('/notification/:id', NotificationController.update);

// rota para os nossos arquivo solitando um por vez com o single
routes.post('/files', upload.single('file'), FileController.store);

export default routes;
