const { Router } = require("express");
const {
  leaderboardGet,
  leaderboardPost,
} = require("../controllers/leaderboardController");

const router = Router();

router.get("/:imageId", leaderboardGet);
router.post("/:gameId", leaderboardPost);

module.exports = router;
