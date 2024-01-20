import { Router } from 'express';
import { createProduct } from '../controllers/product';
import { errorHandler } from '../error-handler';
import authMiddleware from '../middlewares/auth';
import adminMiddleware from '../middlewares/admin';

const productRoutes: Router = Router();

productRoutes.post(
  '/',
  authMiddleware,
  adminMiddleware,
  errorHandler(createProduct),
);

export default productRoutes;
