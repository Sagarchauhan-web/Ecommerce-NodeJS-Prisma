import { Request, Response } from 'express';
import { prismaClient } from '..';
import { AddressSchema, UpdateUserSchema } from '../schema/user';
import { NotFoundException } from '../exceptions/notFound';
import { ErrorCodes } from '../exceptions/root';
import { Address } from '@prisma/client';
import { BadRequestsException } from '../exceptions/badReaquest';

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

export const updateUser = async (req: Request, res: Response) => {
  const validatedData = UpdateUserSchema.parse(req.body);

  let shippingAddress: Address;
  let billingAddress: Address;

  if (validatedData.defaultShippingAddress) {
    try {
      shippingAddress = await prismaClient.address.findFirstOrThrow({
        where: { id: validatedData.defaultShippingAddress! },
      });
      if (shippingAddress.userId !== req.user?.id) {
        throw new BadRequestsException(
          'Address does not belong to the user',
          ErrorCodes.ADDRESS_DOES_NOT_BELONG,
        );
      }
    } catch (error) {
      throw new NotFoundException(
        'Address not found',
        ErrorCodes.ADDRESS_NOT_FOUND,
      );
    }
  }

  if (validatedData.defaultBillingAddress) {
    try {
      billingAddress = await prismaClient.address.findFirstOrThrow({
        where: { id: validatedData.defaultBillingAddress! },
      });

      if (billingAddress.userId !== req.user?.id) {
        throw new BadRequestsException(
          'Address does not belong to the user',
          ErrorCodes.ADDRESS_DOES_NOT_BELONG,
        );
      }
    } catch (error) {
      throw new NotFoundException(
        'Address not found',
        ErrorCodes.ADDRESS_NOT_FOUND,
      );
    }
  }

  const updatedUser = await prismaClient.user.update({
    where: { id: req.user?.id },
    data: validatedData,
  });

  res.json(updatedUser);
};
