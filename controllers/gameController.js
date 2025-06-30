const db = require("../db/queries");
const { sampleSize } = require("lodash");

const allImagesGet = async (req, res) => {
  const images = await db.getAllImages();

  res.json(images);
};

const newGamePost = async (req, res) => {
  //TODO:add validation
  const { imageId } = req.body;
  const { id: gameId } = await db.createGame(+imageId);
  const allCharacterIds = await db.getImageCharacterIds(+imageId);
  const characterIds = sampleSize(allCharacterIds, 3);
  await db.createObjectives(gameId, characterIds);

  return res.redirect(`/game/${gameId}`);
};

const gameGet = async (req, res) => {
  const { gameId } = req.params;
  const game = await db.getGame(+gameId);

  //delete character location if not found
  game.objectives.forEach((objective) => {
    if (!objective.found) {
      delete objective.character.location;
    }
  });

  return res.json(game);
};

const guessPost = async (req, res) => {
  const now = new Date();
  //TODO: add validation
  const { x: xGuess, y: yGuess, characterId } = req.body;
  const { gameId } = req.params;
  const game = await db.getGame(+gameId);
  if (game.endTime) {
    return res.status(400).json({ message: "The game has ended" });
  }

  //check guess details against game
  const { width, height } = game.image;
  const { x: xPercent, y: yPercent } = game.image.percentGuessTolerance;
  const xTolerance = (width * (xPercent / 100)) / 2;
  const yTolerance = (height * (yPercent / 100)) / 2;
  const objectiveIndex = game.objectives.findIndex(
    (objective) => objective.character.id === +characterId
  );
  const character = game.objectives[objectiveIndex].character;
  const { x: xActual, y: yActual } = character.location;

  //if guess is correct update objective
  if (
    xGuess >= xActual - xTolerance &&
    xGuess <= xActual + xTolerance &&
    yGuess >= yActual - yTolerance &&
    yGuess <= yActual + yTolerance
  ) {
    await db.updateObjective(game.id, character.id, { found: true });
    game.objectives[objectiveIndex].found = true;
  }

  //increment guess counter
  const updatePayload = {
    nGuesses: game.nGuesses + 1,
  };

  //if all characters found set endTime to now
  if (game.objectives.reduce((prev, cur) => prev && cur.found, true)) {
    updatePayload.endTime = now;
  }
  await db.updateGame(+gameId, updatePayload);

  return res.redirect(`/game/${gameId}`);
};

module.exports = { allImagesGet, newGamePost, gameGet, guessPost };
