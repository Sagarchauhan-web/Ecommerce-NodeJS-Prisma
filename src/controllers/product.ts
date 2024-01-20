import { Request, Response } from 'express';
import { prismaClient } from '..';
import { NotFoundException } from '../exceptions/notFound';
import { ErrorCodes } from '../exceptions/root';

export const createProduct = async (req: Request, res: Response) => {
  const product = await prismaClient.product.create({
    data: {
      ...req.body,
      tags: req.body.tags.join(','),
    },
  });

  return res.json(product);
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const product = req.body;
    if (product) product.tags = product.tags.join(',');

    const result = await prismaClient.product.update({
      where: { id: Number(req.params.id) },
      data: product,
    });

    res.json(result);
  } catch (error) {
    throw new NotFoundException(
      'Product Not Found',
      ErrorCodes.PRODUCT_NOT_FOUND,
    );
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    await prismaClient.product.delete({
      where: { id: Number(req.params.id) },
    });

    res.sendStatus(200);
  } catch (error) {
    throw new NotFoundException(
      'Product Not Found',
      ErrorCodes.PRODUCT_NOT_FOUND,
    );
  }
};

// Pagination {count: 100, data: []}
export const listProducts = async (req: Request, res: Response) => {
  const count = await prismaClient.product.count();

  const skip = req.query.skip ? +req.query.skip : 0;
  const products = await prismaClient.product.findMany({
    skip: skip,
    take: 5,
  });

  res.json({ count, products });
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await prismaClient.product.findUnique({
      where: { id: Number(req.params.id) },
    });

    res.json(product);
  } catch (error) {
    throw new NotFoundException(
      'Product Not Found',
      ErrorCodes.PRODUCT_NOT_FOUND,
    );
  }
};
