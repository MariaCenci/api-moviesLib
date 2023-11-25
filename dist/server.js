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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = __importDefault(require("express"));
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
const PORT = 4000;
app.use(express_1.default.json());
app.get('/myMovies', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const movies = yield prisma.favouriteMovie.findMany({
            select: {
                id: true,
                name: true
            }
        });
        return res.status(200).send(movies);
    }
    catch (error) {
        return res.status(400).send({ msg: error });
    }
}));
app.listen(PORT, () => {
    console.log(`server initialized at http://localhost:${PORT}`);
});
