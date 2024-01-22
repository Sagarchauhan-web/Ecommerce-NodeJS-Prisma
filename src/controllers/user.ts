import { Request, Response } from 'express';
import { prismaClient } from '..';
import { AddressSchema } from '../schema/user';
import { NotFoundException } from '../exceptions/notFound';
import { ErrorCodes } from '../exceptions/root';

export const addAddress = async (req: Request, res: Response) => {
  AddressSchema.parse(req.body);

  const address = await prismaClient.address.create({
    data: { ...req.body, userId: req.user?.id },
  });

  res.json(address);
};

export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const addressId = req.params.id;
    await prismaClient.address.delete({ where: { id: +addressId } });

    res.json({ success: true });
  } catch (error) {
    throw new NotFoundException(
      'Address not found',
      ErrorCodes.ADDRESS_NOT_FOUND,
    );
  }
};

export const listAddress = async (req: Request, res: Response) => {
  const allAddress = await prismaClient.address.findMany();

  res.json(allAddress);
};
