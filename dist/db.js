"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield prisma.favoriteMovie.findMany();
            console.log("Resultado da consulta:", result);
        }
        catch (error) {
            console.error("Erro ao consultar o banco de dados:", error);
        }
        finally {
            yield prisma.$disconnect();
        }
        const printUsers = () => __awaiter(this, void 0, void 0, function* () {
            const users = yield prisma.user.findMany();
            console.log("all users:", users);
        });
        const user1 = yield prisma.user.create({
            data: {
                email: "teste@gmail.com",
                passwordHash: 'aa'
            },
        });
        console.log(user1, "created new user");
        yield printUsers();
    });
}
main()
    .catch((e) => {
    throw e;
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
