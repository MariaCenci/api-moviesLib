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
const bcrypt_1 = require("bcrypt");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
//const prisma = new PrismaClient();
const prisma = new client_1.PrismaClient({
    datasources: {
        db: {
            url: 'postgresql://ep-patient-night-16675703.us-east-2.aws.neon.tech',
        },
    },
});
const server = (0, express_1.default)();
//const PORT_SERVER = process.env.PORT_SERVER;
const PORT = 4000;
const baseURL = process.env.BASE_URL || 'http://localhost:4000';
//const baseURL ='http://localhost:4000';
/*
const corsOptions = {
  origin: 'https://movies-lib-client-9taofdav8-maria-cencis-projects.vercel.app',
  optionsSuccessStatus: 200,
};


*/
/*
const corsOptions = {
  origin: '*', // ou '*'
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};
server.use(cors(corsOptions));
*/
server.use((0, cors_1.default)({
    origin: 'https://movies-lib-client.vercel.app/',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));
server.use((0, cors_1.default)());
server.use(express_1.default.json());
server.get(`/`, (req, res) => {
    res.send("test ciao");
    console.log("test");
});
//register
server.post(`${baseURL}/register`, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const passwordHash = yield (0, bcrypt_1.hashSync)(password, 10);
        const existingUser = yield prisma.user.findUnique({
            where: {
                email,
            },
        });
        if (existingUser) {
            return res.status(400).send({ error: "Email already in use" });
        }
        const user = yield prisma.user.create({
            data: {
                email,
                passwordHash,
            },
        });
        console.log(user);
        return res.status(201).send({ message: "User registered successfully" });
    }
    catch (error) {
        res.status(500).send({ error: "Unable to save user in the database" });
    }
}));
// login
server.post(`${baseURL}/login`, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, userId } = req.body;
        const user = yield prisma.user.findUnique({
            where: {
                email,
                userId: userId,
            },
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const passwordMatch = yield (0, bcrypt_1.compareSync)(password, user.passwordHash);
        if (!passwordMatch) {
            return res.status(401).send({ error: "Invalid authentication" });
        }
        console.log(userId);
        return res
            .status(200)
            .send({ message: "Logged in successfully", userId: user.userId });
    }
    catch (error) {
        res.status(500).send({ error: "Login error" });
    }
}));
/*get fav movies */
server.get(`${baseURL}/api/favoriteMovies/:userId`, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const movies = yield prisma.favoriteMovie.findMany({
            where: {
                userId: userId,
            },
            select: {
                id: true,
                original_title: true,
                poster_path: true,
            },
        });
        res.status(200).send(movies);
    }
    catch (error) {
        res.status(400).send({ msg: error });
    }
}));
// add favorite 
server.post(`${baseURL}/api/addFavorite`, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, movieId, original_title, poster_path } = req.body;
    if (typeof userId !== undefined && movieId !== undefined) {
        if (!movieId || !original_title || !poster_path) {
            return res.status(400).send({ error: "Invalid request" });
        }
        try {
            const existingFavorite = yield prisma.favoriteMovie.findFirst({
                where: {
                    movieId: movieId,
                    userId: userId
                },
            });
            if (existingFavorite) {
                return res.status(400).send("Movie already added to favorites");
            }
            const favoriteMovie = yield prisma.favoriteMovie.create({
                data: {
                    movieId: movieId,
                    original_title: original_title,
                    poster_path: poster_path,
                    user: {
                        connect: {
                            userId: userId,
                        },
                    },
                },
            });
            console.log(movieId);
            return res.send(favoriteMovie + "Movie added to favorites successfully");
        }
        catch (error) {
            return res
                .status(500)
                .send(console.log(error) + "Error adding to favorites");
        }
    }
    else {
        res.send("Params not valid");
    }
}));
// delete favorites
server.delete(`${baseURL}/api/removeFavorite`, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, movieId } = req.body;
    try {
        const favoriteMovie = yield prisma.favoriteMovie.findFirst({
            where: {
                userId: userId,
                id: movieId,
            },
        });
        if (!favoriteMovie) {
            return res.status(404).send("Favorite movie not found");
        }
        yield prisma.favoriteMovie.delete({
            where: {
                id: favoriteMovie.id,
            },
        });
        yield fetch(`${baseURL}/api/updateFavorites`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId }),
        });
        res.status(200).send("Movie removed from favorites");
    }
    catch (error) {
        res.status(500).send(console.log(error) + "Erro ao remover filme dos favoritos");
    }
}));
//update favorites
server.put(`${baseURL}/api/updateFavorites`, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    try {
        const updatedFavorites = yield prisma.favoriteMovie.findMany({
            where: {
                userId: userId,
            },
        });
        res.status(200).send(updatedFavorites + "updated favorites");
    }
    catch (error) {
        console.error("cannot update list:", error);
        res.status(500).send("Cannot update list");
    }
}));
// get from watch list
server.get(`${baseURL}/api/watchList/:userId`, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const movies = yield prisma.watchList.findMany({
            where: {
                userId: userId,
            },
            select: {
                id: true,
                original_title: true,
                poster_path: true,
            },
        });
        res.status(200).send(movies);
    }
    catch (error) {
        res.status(400).send({ msg: error });
    }
}));
//add to watch list
server.post("/api/addToWatchList", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, movieId, original_title, poster_path } = req.body;
    if (typeof userId !== undefined && movieId !== undefined) {
        if (!movieId || !original_title || !poster_path) {
            return res.status(400).send({ error: "Invalid request" });
        }
        try {
            const existingFavorite = yield prisma.watchList.findFirst({
                where: {
                    movieId: movieId,
                    userId: userId
                },
            });
            if (existingFavorite) {
                return res.status(400).send("Movie already in the watch list");
            }
            const favoriteMovie = yield prisma.watchList.create({
                data: {
                    movieId: movieId,
                    original_title: original_title,
                    poster_path: poster_path,
                    user: {
                        connect: {
                            userId: userId,
                        },
                    },
                },
            });
            console.log(movieId);
            return res.send(favoriteMovie + "Movie added to watch list successfully");
        }
        catch (error) {
            return res
                .status(500)
                .send(console.log(error) + "Error adding to watch list");
        }
    }
    else {
        res.send("Params not valid");
    }
}));
// remove from watch list
server.delete(`${baseURL}/api/removeFromWatchList`, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, movieId } = req.body;
    try {
        const movieFromWatchList = yield prisma.watchList.findFirst({
            where: {
                userId: userId,
                id: movieId,
            },
        });
        if (!movieFromWatchList) {
            return res.status(404).send("Favorite movie not found");
        }
        // Remova o filme da lista de favoritos no Prisma
        yield prisma.watchList.delete({
            where: {
                id: movieFromWatchList.id,
            },
        });
        yield fetch(`${baseURL}/api/updateWatchList`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId }),
        });
        res.status(200).send("Movie removed from watch list");
    }
    catch (error) {
        res.status(500).send(console.log(error) + "cannot remove movie from watch list");
    }
}));
server.put(`${baseURL}/api/updateWatchList`, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    try {
        const updatedFavorites = yield prisma.favoriteMovie.findMany({
            where: {
                userId: userId,
            },
        });
        res.status(200).send(updatedFavorites + "updated favorites");
    }
    catch (error) {
        console.error("cannot update list:", error);
        res.status(500).send("Ecannot update list");
    }
}));
//server.listen(PORT_SERVER, () => {
// console.log(`server initialized at http://localhost:${PORT_SERVER}`);
//});
server.listen(process.env.PORT || PORT, () => {
    //host: '0.0.0.0',
    //port: process.env.PORT ? Number(process.env.PORT) : 4000
    console.log(`running on ${PORT}`);
});
/*
server.listen(4000, () => {
  console.log("initialized at 4000")
})*/ 
