import { Request, Response } from 'express';
import { CreateCartSchema, UpdateCartSchema } from '../schema/cart';
import { NotFoundException } from '../exceptions/notFound';
import { ErrorCodes } from '../exceptions/root';
import { CartItem, Product } from '@prisma/client';
import { prismaClient } from '..';

export const addItemToCart = async (req: Request, res: Response) => {
  const validatedData = CreateCartSchema.parse(req.body);
  let cartItem: CartItem | null;
  let product: Product;

  try {
    product = await prismaClient.product.findFirstOrThrow({
      where: { id: validatedData.productId },
    });
  } catch (error) {
    throw new NotFoundException(
      'Product not found',
      ErrorCodes.PRODUCT_NOT_FOUND,
    );
  }

  cartItem = await prismaClient.cartItem.findFirst({
    where: { productId: validatedData.productId, userId: req.user?.id },
  });

  if (!!cartItem) {
    throw new NotFoundException(
      'Product Already Exists',
      ErrorCodes.PRODUCT_NOT_FOUND,
    );
  }

  const cart = await prismaClient.cartItem.create({
    data: {
      userId: req.user?.id!,
      productId: validatedData.productId,
      quantity: validatedData.quantity,
    },
  });

  res.json(cart);
};

export const deleteItemFromCart = async (req: Request, res: Response) => {
  const cartItemId = req.params.id;

  try {
    await prismaClient.cartItem.findFirstOrThrow({
      where: { id: +cartItemId, userId: req.user?.id },
    });
  } catch (error) {
    throw new NotFoundException(
      'Product not found For The User',
      ErrorCodes.PRODUCT_NOT_FOUND,
    );
  }

  await prismaClient.cartItem.delete({
    where: {
      id: +cartItemId,
    },
  });

  res.json({ success: true });
};

export const changeQuantity = async (req: Request, res: Response) => {
  const cartItemId = req.params.id;
  const validatedData = UpdateCartSchema.parse(req.body);

  try {
    await prismaClient.cartItem.findFirstOrThrow({
      where: { id: +cartItemId, userId: req.user?.id },
    });
  } catch (error) {
    throw new NotFoundException(
      'Product not found For The User',
      ErrorCodes.PRODUCT_NOT_FOUND,
    );
  }

  const cart = await prismaClient.cartItem.update({
    where: {
      id: +cartItemId,
    },
    data: validatedData,
  });

  res.json(cart);
};

export const getCart = async (req: Request, res: Response) => {
  const allProducts = await prismaClient.cartItem.findMany({
    where: { userId: req.user?.id },
    include: { product: true },
  });

  res.json(allProducts);
};
