"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userPrismaModel = void 0;
const client_1 = require("@prisma/client");
exports.userPrismaModel = client_1.Prisma.validator()({
    select: {
        userId: true,
        email: true,
    },
});
