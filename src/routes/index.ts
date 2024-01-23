import { Router } from 'express';
import authRoutes from './auth';
import productRoutes from './products';
import usersRoutes from './users';
import cartRoutes from './cart';
import orderRoutes from './order';

const rootRouter: Router = Router();

rootRouter.use('/auth', authRoutes);
rootRouter.use('/products', productRoutes);
rootRouter.use('/user', usersRoutes);
rootRouter.use('/cart', cartRoutes);
rootRouter.use('/order', orderRoutes);

export default rootRouter;
