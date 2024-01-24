import { Request, Response } from 'express';
import { prismaClient } from '..';
import { NotFoundException } from '../exceptions/notFound';
import { ErrorCodes } from '../exceptions/root';
import { OrderStatusUpdateSchema } from '../schema/order';

export const createOrder = async (req: Request, res: Response) => {
  // 1. to create a transaction
  // 2. to list all the cart items and proceed if cart is not empty
  // 3. calculate the total amount
  // 4. fetch address of user
  // 5. to define computed field for formatted address on address module
  // 6. we will create a order and order productsorder products
  // 7. create event
  // 8. to empty the cart
  return await prismaClient.$transaction(async (tx) => {
    const cartItems = await tx.cartItem.findMany({
      where: { userId: req.user?.id },
      include: { product: true },
    });

    if (cartItems.length == 0) {
      return res.json({ message: 'cart is empty' });
    }

    const price = cartItems.reduce(
      (acc, item) => acc + item.quantity * +item.product.price,
      0,
    );

    const address = await tx.address.findFirst({
      where: { id: req.user?.defaultShippingAddress! },
    });

    const order = await tx.order.create({
      data: {
        userId: req.user?.id!,
        netAmount: price,
        address: address?.formattedAddress!,
        Products: {
          create: cartItems.map((cart) => {
            return {
              productId: cart.productId,
              quantity: cart.quantity,
            };
          }),
        },
      },
    });
    const orderEvent = await tx.orderEvent.create({
      data: { orderId: order.id },
    });

    await tx.cartItem.deleteMany({ where: { userId: req.user?.id! } });

    return res.json(order);
  });
};

export const listOrders = async (req: Request, res: Response) => {
  const orders = await prismaClient.order.findMany({
    where: { userId: req.user?.id! },
  });

  res.json(orders);
};

export const cancelOrder = async (req: Request, res: Response) => {
  try {
    return await prismaClient.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id: +req.params.id, userId: req.user?.id },
        data: { status: 'CANCELLED' },
      });

      await tx.orderEvent.create({
        data: { orderId: order.id, status: 'CANCELLED' },
      });

      res.json(order);
    });
  } catch (error) {
    throw new NotFoundException('Order Not Found', ErrorCodes.ORDER_NOT_FOUND);
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await prismaClient.order.findFirstOrThrow({
      where: { id: +req.params.id },
      include: { Products: true, events: true },
    });

    res.json(order);
  } catch (error) {
    throw new NotFoundException('Order Not Found', ErrorCodes.ORDER_NOT_FOUND);
  }
};

export const listAllOrders = async (req: Request, res: Response) => {
  let where = {};
  const skip = req.query.skip ? +req.query.skip : 0;
  const status = req.query.status;
  if (status) {
    where = { status };
  }

  const orders = await prismaClient.order.findMany({
    where: where,
    skip: skip,
    take: 5,
  });

  res.json(orders);
};

export const changeStatus = async (req: Request, res: Response) => {
  const validatedBody = OrderStatusUpdateSchema.parse(req.body);
  try {
    const order = await prismaClient.order.update({
      where: { id: +req.params.id },
      data: { status: validatedBody.status },
    });

    await prismaClient.orderEvent.create({
      data: { orderId: order.id, status: req.body.status },
    });

    res.json(order);
  } catch (error) {
    throw new NotFoundException('Order Not Found', ErrorCodes.ORDER_NOT_FOUND);
  }
};

export const listUserOrders = async (req: Request, res: Response) => {
  try {
    const order = await prismaClient.order.findMany({
      where: { userId: +req.params.id },
    });

    res.json(order);
  } catch (error) {
    throw new NotFoundException('User Not Found', ErrorCodes.USER_NOT_FOUND);
  }
};
