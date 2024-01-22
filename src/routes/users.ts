import { Router } from 'express';
import { login, me, signup } from '../controllers/auth';
import { errorHandler } from '../error-handler';
import authMiddleware from '../middlewares/auth';
import adminMiddleware from '../middlewares/admin';
import { addAddress, deleteAddress, listAddress } from '../controllers/user';

const usersRoutes: Router = Router();

usersRoutes.post('/address', authMiddleware, errorHandler(addAddress));
usersRoutes.delete('/address/:id', authMiddleware, errorHandler(deleteAddress));
usersRoutes.get('/address', authMiddleware, errorHandler(listAddress));

export default usersRoutes;