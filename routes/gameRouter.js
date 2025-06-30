const { Router } = require("express");
const {
  allImagesGet,
  newGamePost,
  gameGet,
  guessPost,
} = require("../controllers/gameController");

const router = Router();

router.get("/", allImagesGet);
router.post("/new", newGamePost);
router.get("/:gameId", gameGet);
router.post("/:gameId/guess", guessPost);

module.exports = router;
