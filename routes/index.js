import { Express } from 'express';
import AppController from '../controllers/AppController';
import AuthController from '../controllers/AuthController';
import UsersController from '../controllers/UsersController';
import FilesController from '../controllers/FilesController';
import { basicAuthenticate, xTokenAuthenticate } from '../middlewares/auth';
import { APIError, errorResponse } from '../middlewares/error';

/**
 * Injects routes with their handlers to the given Express
 * @param {Express} APIs
 */
const injectRoutes = (Api) => {
  Api.get('/status', AppController.getStatus);
  Api.get('/stats', AppController.getStats);

  Api.get('/connect', basicAuthenticate, AuthController.getConnect);
  Api.get('/disconnect', xTokenAuthenticate, AuthController.getDisconnect);

  Api.post('/users', UsersController.postNew);
  Api.get('/users/me', xTokenAuthenticate, UsersController.getMe);

  Api.post('/files', xTokenAuthenticate, FilesController.postUpload);
  Api.get('/files/:id', xTokenAuthenticate, FilesController.getShow);
  Api.get('/files', xTokenAuthenticate, FilesController.getIndex);
  Api.put('/files/:id/publish', xTokenAuthenticate, FilesController.putPublish);
  Api.put('/files/:id/unpublish', xTokenAuthenticate, FilesController.putUnpublish);
  Api.get('/files/:id/data', FilesController.getFile);

  Api.all('*', (req, res, next) => {
    errorResponse(new APIError(404, `Cannot ${req.method} ${req.url}`), req, res, next);
  });
  Api.use(errorResponse);
};

export default injectRoutes;
