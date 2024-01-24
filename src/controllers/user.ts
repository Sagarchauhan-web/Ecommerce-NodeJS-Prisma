import { Request, Response } from 'express';
import { prismaClient } from '..';
import {
  AddressSchema,
  UpdateUserRoleSchema,
  UpdateUserSchema,
} from '../schema/user';
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

export const listUsers = async (req: Request, res: Response) => {
  const skip = req.query.skip ? +req.query.skip : 0;
  const users = await prismaClient.user.findMany({
    skip: skip,
    take: 5,
  });
  res.json(users);
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await prismaClient.user.findFirstOrThrow({
      where: { id: +req.params.id },
      include: { Address: true },
    });

    res.json(user);
  } catch (error) {
    throw new NotFoundException('User not found', ErrorCodes.USER_NOT_FOUND);
  }
};

export const changeUserRole = async (req: Request, res: Response) => {
  const validatedBody = UpdateUserRoleSchema.parse(req.body);
  try {
    const user = await prismaClient.user.update({
      where: { id: +req.params.id },
      data: { role: validatedBody.role },
    });

    res.json(user);
  } catch (error) {
    throw new NotFoundException('User not found', ErrorCodes.USER_NOT_FOUND);
  }
};
