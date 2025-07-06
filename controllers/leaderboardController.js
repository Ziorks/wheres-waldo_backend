const db = require("../db/queries");

const leaderboardGet = async (req, res) => {
  const { imageId } = req.params;
  const leaderboard = await db.getLeaderboard(+imageId);

  return res.json(leaderboard.games);
};

const leaderboardPost = async (req, res) => {
  //TODO: add validation
  const { gameId } = req.params;
  const game = await db.getGame(+gameId);
  //probably do this in the validation
  if (game.playerName || game.time) {
    return res.status(400).json({
      message: "This game has already been posted to the leaderboard",
    });
  }
  const time = new Date(game.endTime) - new Date(game.startTime);
  const { playerName } = req.body;

  await db.updateGame(+gameId, { playerName: playerName.toUpperCase(), time });

  return res.json({
    message: "Your score has been posted to the leaderboard.",
  });
};
module.exports = { leaderboardGet, leaderboardPost };
