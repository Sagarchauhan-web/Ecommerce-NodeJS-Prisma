import { Router } from 'express';
import { createProduct } from '../controllers/product';
import { errorHandler } from '../error-handler';
import authMiddleware from '../middlewares/auth';

const productRoutes: Router = Router();

productRoutes.post('/', authMiddleware, errorHandler(createProduct));

export default productRoutes;
