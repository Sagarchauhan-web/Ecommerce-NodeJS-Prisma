import { compareSync, hashSync } from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { prismaClient } from '..';
import { BadRequestsException } from '../exceptions/badReaquest';
import { ErrorCodes } from '../exceptions/root';
import { JWT_SECRET } from '../secrets';
import { UnprocessableEntity } from '../exceptions/validation';
import { SignUpSchema } from '../schema/user';
import { NotFoundException } from '../exceptions/notFound';
import { User } from '@prisma/client';

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  SignUpSchema.parse(req.body);
  const { email, password, name } = req.body;

  let user = await prismaClient.user.findFirst({ where: { email: email } });

  if (user) {
    return new BadRequestsException(
      'user already exists',
      ErrorCodes.USER_ALREADY_EXIST,
    );
  }

  user = await prismaClient.user.create({
    data: { name, email, password: hashSync(password, 10) },
  });

  res.json(user);
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password } = req.body;

  let user = await prismaClient.user.findFirst({ where: { email: email } });

  if (!user) {
    return new NotFoundException(
      'user does not exists',
      ErrorCodes.USER_NOT_FOUND,
    );
  }

  if (!compareSync(password, user.password)) {
    return new BadRequestsException(
      'Incorrect Password',
      ErrorCodes.INCORRECT_PASSWORD,
    );
  }

  const token = jwt.sign(
    {
      userId: user.id,
    },
    JWT_SECRET,
  );

  res.json({ user, token });
};

export const me = async (req: Request & { user: User }, res: Response) => {
  return res.json(req.user);
};
