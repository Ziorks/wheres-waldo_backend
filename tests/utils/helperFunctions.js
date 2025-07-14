const { simpleFaker } = require("@faker-js/faker");
const db = require("../../db/queries");

const createImage = async () => {
  const width = simpleFaker.number.int({ max: 5000 });
  const height = simpleFaker.number.int({ max: 5000 });
  const xPercentGuessTolerance = simpleFaker.number.int({ max: width });
  const yPercentGuessTolerance = simpleFaker.number.int({ max: height });

  const imagePayload = {
    name: simpleFaker.string.alpha(15),
    src: simpleFaker.string.alpha(10),
    width,
    height,
    xPercentGuessTolerance,
    yPercentGuessTolerance,
  };

  const image = await db.createImage(imagePayload);
  image.percentGuessTolerance = {
    x: xPercentGuessTolerance,
    y: yPercentGuessTolerance,
  };
  return image;
};

const createCharacter = async (image) => {
  const xLocation = simpleFaker.number.int({ max: image.width });
  const yLocation = simpleFaker.number.int({ max: image.height });

  const characterPayload = {
    avatar: simpleFaker.string.alpha(10),
    imageId: image.id,
    name: simpleFaker.string.alpha(10),
    xLocation,
    yLocation,
  };
  const character = await db.createCharacter(characterPayload);
  character.location = { x: xLocation, y: yLocation };
  return character;
};

const createGame = async (imageId, { isEnded, isClaimed } = {}) => {
  const game = await db.createGame(imageId);
  if (isEnded || isClaimed) {
    const startTime = simpleFaker.date.recent({ days: 1 });
    const endTime = simpleFaker.date.soon({ days: 1 });
    const updatePayload = { startTime, endTime };
    if (isClaimed) {
      updatePayload.playerName = simpleFaker.string.alpha(3).toUpperCase();
      updatePayload.time = endTime - startTime;
    }
    await db.updateGame(game.id, updatePayload);
  }
  return await db.getGame(game.id);
};

const createLeaderboard = async (imageId) => {
  const count = simpleFaker.number.int({ min: 3, max: 7 });
  for (let i = 0; i < count; i++) {
    await createGame(imageId, { isClaimed: true });
  }

  const leaderboard = await db.getLeaderboard(imageId);
  return leaderboard;
};

module.exports = {
  createImage,
  createCharacter,
  createGame,
  createLeaderboard,
};
