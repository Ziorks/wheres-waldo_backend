require("dotenv").config();
const { PrismaClient } = require("../generated/prisma");

const databaseUrl =
  process.env.NODE_ENV.trim() === "test"
    ? process.env.TEST_DATABASE_URL
    : process.env.DATABASE_URL;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

async function getAllImages() {
  const images = await prisma.image.findMany({
    omit: {
      vector2dId: true,
    },
  });
  return images;
}

async function getImageCharacterIds(imageId) {
  const image = await prisma.image.findUnique({
    where: {
      id: imageId,
    },
    select: {
      characters: {
        select: {
          id: true,
        },
      },
    },
  });
  return image.characters.map((character) => ({
    characterId: character.id,
  }));
}

async function getLeaderboard(imageId) {
  const leaderboard = await prisma.image.findUnique({
    where: {
      id: imageId,
    },
    select: {
      games: {
        where: {
          NOT: {
            playerName: null,
            time: null,
          },
        },
        select: {
          playerName: true,
          time: true,
        },
        orderBy: {
          time: {
            sort: "asc",
          },
        },
      },
    },
  });

  return leaderboard;
}

async function getGame(gameId) {
  const game = await prisma.game.findUnique({
    where: {
      id: gameId,
    },
    include: {
      objectives: {
        include: {
          character: {
            include: {
              location: {
                omit: {
                  id: true,
                },
              },
            },
            omit: {
              vector2dId: true,
              imageId: true,
            },
          },
        },
        omit: {
          gameId: true,
          characterId: true,
        },
      },
      image: {
        include: {
          percentGuessTolerance: {
            omit: {
              id: true,
            },
          },
        },
        omit: {
          vector2dId: true,
        },
      },
    },
    omit: {
      imageId: true,
    },
  });

  return game;
}

async function updateGame(
  gameId,
  { startTime, endTime, nGuesses, playerName, time }
) {
  await prisma.game.update({
    where: {
      id: gameId,
    },
    data: {
      startTime,
      endTime,
      nGuesses,
      playerName,
      time,
    },
  });
}

async function createGame(imageId) {
  const game = await prisma.game.create({
    data: {
      imageId,
    },
  });
  return game;
}

async function createObjectives(gameId, characterIds) {
  characterIds = characterIds.map((id) => ({ ...id, gameId }));
  await prisma.objective.createMany({
    data: characterIds,
  });
}

async function updateObjective(gameId, characterId, { found }) {
  await prisma.objective.update({
    where: {
      characterId_gameId: {
        characterId,
        gameId,
      },
    },
    data: {
      found,
    },
  });
}

module.exports = {
  getAllImages,
  getImageCharacterIds,
  getLeaderboard,
  getGame,
  createGame,
  updateGame,
  createObjectives,
  updateObjective,
};
