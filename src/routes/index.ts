import { Router } from 'express';
import authRoutes from './auth';
import productRoutes from './products';
import usersRoutes from './users';

const rootRouter: Router = Router();

rootRouter.use('/auth', authRoutes);
rootRouter.use('/products', productRoutes);
rootRouter.use('/user', usersRoutes);

export default rootRouter;
