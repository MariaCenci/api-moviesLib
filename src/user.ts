import { Prisma } from '@prisma/client';

export const userPrismaModel = Prisma.validator<Prisma.UserArgs>()({
  select: {
    userId: true,
    email: true,

  },
});



export type User = Prisma.UserGetPayload<typeof userPrismaModel>;