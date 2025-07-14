require("dotenv").config();
const { PrismaClient, Prisma } = require("../generated/prisma");

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

async function createImage({
  src,
  width,
  height,
  xPercentGuessTolerance,
  yPercentGuessTolerance,
}) {
  const image = await prisma.image.create({
    data: {
      width,
      height,
      src,
      percentGuessTolerance: {
        create: {
          x: xPercentGuessTolerance,
          y: yPercentGuessTolerance,
        },
      },
    },
  });

  return image;
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
        select: {
          found: true,
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
        orderBy: {
          characterId: "asc",
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

async function createCharacter({
  avatar,
  imageId,
  name,
  xLocation,
  yLocation,
}) {
  const character = await prisma.character.create({
    data: {
      avatar,
      image: { connect: { id: imageId } },
      name,
      location: {
        create: {
          x: xLocation,
          y: yLocation,
        },
      },
    },
  });

  return character;
}

async function resetDatabase() {
  const tableNames = Object.values(Prisma.ModelName);
  for (const tableName of tableNames) {
    await prisma.$queryRawUnsafe(
      `TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE`
    );
  }
}

module.exports = {
  getAllImages,
  createImage,
  getImageCharacterIds,
  getLeaderboard,
  getGame,
  createGame,
  updateGame,
  createObjectives,
  updateObjective,
  createCharacter,
  resetDatabase,
};
