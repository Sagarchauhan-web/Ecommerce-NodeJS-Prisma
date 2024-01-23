import { PrismaClient } from '@prisma/client';
import express, { Express } from 'express';
import { errorMiddleware } from './middlewares/errors';
import rootRouter from './routes';
import { PORT } from './secrets';
import { SignUpSchema } from './schema/user';

export const prismaClient = new PrismaClient().$extends({
  result: {
    address: {
      formattedAddress: {
        needs: {
          lineOne: true,
          lineTwo: true,
          city: true,
          country: true,
          pincode: true,
        },
        compute: (addr) => {
          return `${addr.lineOne}, ${addr.lineTwo}, ${addr.city}, ${addr.country}-${addr.pincode}}`;
        },
      },
    },
  },
});
// { log: ['query'] }
// .$extends({
//   query: {
//     user: {
//       create({ args, query }) {
//         args.data = SignUpSchema.parse(args.data);
//         return query(args);
//       },
//     },
//   },
// });

const app: Express = express();

app.use(express.json());
app.use('/api', rootRouter);
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log('app listening on port 3000');
});
