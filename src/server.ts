import { PrismaClient } from "@prisma/client";
import { compareSync, hashSync } from "bcrypt";
import express from "express";
import cors from "cors";

//const prisma = new PrismaClient();


const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://ep-patient-night-16675703.us-east-2.aws.neon.tech',
    },
  },
});

const server = express();
//const PORT_SERVER = process.env.PORT_SERVER;

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


server.use(cors({
  origin: 'https://movies-lib-client.vercel.app/',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));


server.use(cors());

server.use(express.json());

server.get(`/`, (req, res) => {
  res.send("test ciao");
  console.log("test")
});

//register

server.post(`${baseURL}/register`, async (req, res) => {
  try {
    const { email, password } = req.body;
    const passwordHash = await hashSync(password, 10);

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res.status(400).send({ error: "Email already in use" });
    }

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
      },
    });
    console.log(user);

    return res.status(201).send({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).send({ error: "Unable to save user in the database" });
  }
});



// login
server.post(`${baseURL}/login`, async (req, res) => {
  try {
    const { email, password, userId } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        email,
        userId: userId,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const passwordMatch = await compareSync(password, user.passwordHash);

    if (!passwordMatch) {
      return res.status(401).send({ error: "Invalid authentication" });
    }
    console.log(userId);
   
    return res
      .status(200)
      .send({ message: "Logged in successfully", userId: user.userId });
  } catch (error) {
    res.status(500).send({ error: "Login error" });
  }
});

/*get fav movies */
server.get(`${baseURL}/api/favoriteMovies/:userId`, async (req, res) => {
  try {
    const { userId } = req.params;
    const movies = await prisma.favoriteMovie.findMany({
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
  } catch (error) {
    res.status(400).send({ msg: error });
  }
});


// add favorite 
server.post(`${baseURL}/api/addFavorite`, async (req, res) => {
  const { userId, movieId, original_title, poster_path } = req.body;

  if (typeof userId !== undefined && movieId !== undefined) {

    if (!movieId || !original_title || !poster_path) {
      return res.status(400).send({ error: "Invalid request" });
    }

    try {
      const existingFavorite = await prisma.favoriteMovie.findFirst({
        where: {
          movieId: movieId,
          userId: userId
        },
      });

      if (existingFavorite) {
        return res.status(400).send("Movie already added to favorites");
      }


      const favoriteMovie = await prisma.favoriteMovie.create({
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
      console.log(movieId)

      return res.send(favoriteMovie + "Movie added to favorites successfully");
    } catch (error) {
      return res
        .status(500)
        .send(console.log(error) + "Error adding to favorites");
    }
  } else {
    res.send("Params not valid");
  }
});




// delete favorites
server.delete(`${baseURL}/api/removeFavorite`, async (req, res) => {
  const { userId, movieId } = req.body;

  try {
    const favoriteMovie = await prisma.favoriteMovie.findFirst({
      where: {
        userId: userId,
        id: movieId,
      },
    });

    if (!favoriteMovie) {
      return res.status(404).send("Favorite movie not found");
    }

   
    await prisma.favoriteMovie.delete({
      where: {
        id: favoriteMovie.id,
      },
    });

    await fetch(`${baseURL}/api/updateFavorites`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    res.status(200).send("Movie removed from favorites");
  } catch (error) {
    res.status(500).send(console.log(error) + "Erro ao remover filme dos favoritos");
  }
});

//update favorites
server.put(`${baseURL}/api/updateFavorites`, async (req, res) => {
  const { userId } = req.body;


  try {
    
    const updatedFavorites = await prisma.favoriteMovie.findMany({
      where: {
        userId: userId,
      },
    });

  res.status(200).send(updatedFavorites + "updated favorites");
  } catch (error) {
    console.error("cannot update list:", error);
    res.status(500).send("Cannot update list");
  }

});




// get from watch list
server.get(`${baseURL}/api/watchList/:userId`, async (req, res) => {
  try {
    const { userId } = req.params;
    const movies = await prisma.watchList.findMany({
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
  } catch (error) {
    res.status(400).send({ msg: error });
  }
});

//add to watch list
server.post("/api/addToWatchList", async (req, res) => {
  const { userId, movieId, original_title, poster_path } = req.body;

  if (typeof userId !== undefined && movieId !== undefined) {
    if (!movieId || !original_title || !poster_path) {
      return res.status(400).send({ error: "Invalid request" });
    }

    try {
      const existingFavorite = await prisma.watchList.findFirst({
        where: {
          movieId: movieId,
          userId: userId
        },
      });

      if (existingFavorite) {
        return res.status(400).send("Movie already in the watch list");
      }


      const favoriteMovie = await prisma.watchList.create({
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
      console.log(movieId)

      return res.send(favoriteMovie + "Movie added to watch list successfully");
    } catch (error) {
      return res
        .status(500)
        .send(console.log(error) + "Error adding to watch list");
    }
  } else {
    res.send("Params not valid");
  }
});

// remove from watch list
server.delete(`${baseURL}/api/removeFromWatchList`, async (req, res) => {
  const { userId, movieId } = req.body;

  try {
    const movieFromWatchList = await prisma.watchList.findFirst({
      where: {
        userId: userId,
        id: movieId,
      },
    });

    if (!movieFromWatchList) {
      return res.status(404).send("Favorite movie not found");
    }

    // Remova o filme da lista de favoritos no Prisma
    await prisma.watchList.delete({
      where: {
        id: movieFromWatchList.id,
      },
    });

    await fetch(`${baseURL}/api/updateWatchList`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    res.status(200).send("Movie removed from watch list");
  } catch (error) {
    res.status(500).send(console.log(error) + "cannot remove movie from watch list");
  }
});

server.put(`${baseURL}/api/updateWatchList`, async (req, res) => {
  const { userId } = req.body;


  try {
    
    const updatedFavorites = await prisma.favoriteMovie.findMany({
      where: {
        userId: userId,
      },
    });

  res.status(200).send(updatedFavorites + "updated favorites");
  } catch (error) {
    console.error("cannot update list:", error);
    res.status(500).send("Ecannot update list");
  }

});




//server.listen(PORT_SERVER, () => {
 // console.log(`server initialized at http://localhost:${PORT_SERVER}`);
//});


server.listen({
  host: '0.0.0.0',
  port: process.env.PORT ? Number(process.env.PORT) : 4000
})
/*
server.listen(4000, () => {
  console.log("initialized at 4000")
})*/