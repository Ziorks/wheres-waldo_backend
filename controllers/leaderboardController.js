const db = require("../db/queries");

const leaderboardGet = async (req, res) => {
  const { imageId } = req.params;
  const leaderboard = await db.getLeaderboard(+imageId);
  if (!leaderboard) {
    return res
      .status(400)
      .json({ message: "The imageId you provided doesn't exist" });
  }

  return res.json(leaderboard.games);
};

const leaderboardPost = async (req, res) => {
  const { playerName } = req.body;
  if (!playerName || playerName.length !== 3) {
    return res
      .status(400)
      .json({
        message: "Please provide a playerName that is exactly 3 characters",
      });
  }

  const { gameId } = req.params;
  const game = await db.getGame(+gameId);
  if (!game) {
    return res
      .status(400)
      .json({ message: "The gameId you provided doesn't exist" });
  }
  if (game.playerName || game.time) {
    return res.status(403).json({
      message: "This game has already been posted to the leaderboard",
    });
  }
  if (!game.endTime) {
    return res.status(403).json({
      message: "This game has not been completed",
    });
  }

  await db.updateGame(+gameId, {
    playerName: req.body.playerName.toUpperCase(),
    time: game.endTime - game.startTime,
  });

  return res.json({
    message: "Your score has been posted to the leaderboard.",
  });
};
module.exports = { leaderboardGet, leaderboardPost };
