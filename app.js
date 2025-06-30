require("dotenv").config();
const express = require("express");
const cors = require("cors");
const gameRouter = require("./routes/gameRouter");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/game", gameRouter);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
