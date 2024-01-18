import { compareSync, hashSync } from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { prismaClient } from '..';
import { BadRequestsException } from '../exceptions/badReaquest';
import { ErrorCodes } from '../exceptions/root';
import { JWT_SECRET } from '../secrets';
import { UnprocessableEntity } from '../exceptions/validation';

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password, name } = req.body;

    let user = await prismaClient.user.findFirst({ where: { email: email } });

    if (user) {
      return next(
        new BadRequestsException(
          'user already exists',
          ErrorCodes.USER_ALREADY_EXIST,
        ),
      );
    }

    user = await prismaClient.user.create({
      data: { name, email, password: hashSync(password, 10) },
    });

    res.json(user);
  } catch (error: any) {
    next(
      new UnprocessableEntity(
        error?.cause?.issue,
        'Unprocessable entity',
        ErrorCodes.UNPROCESSABLE_ENTITY,
      ),
    );
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password } = req.body;

  let user = await prismaClient.user.findFirst({ where: { email: email } });

  if (!user) {
    return next(
      new BadRequestsException(
        'user does not exists',
        ErrorCodes.USER_NOT_FOUND,
      ),
    );
  }

  if (!compareSync(password, user.password)) {
    return next(
      new BadRequestsException(
        'Incorrect Password',
        ErrorCodes.INCORRECT_PASSWORD,
      ),
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
