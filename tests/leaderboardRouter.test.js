const leaderboardRouter = require("../routes/leaderboardRouter");

const request = require("supertest");
const express = require("express");
const { beforeAll, describe, afterEach, it } = require("@jest/globals");
const { simpleFaker } = require("@faker-js/faker");
const db = require("../db/queries");
const {
  createImage,
  createGame,
  createLeaderboard,
} = require("./utils/helperFunctions");

const app = express();

app.use(express.json());
app.use("/leaderboard", leaderboardRouter);

describe("/leaderboard", () => {
  beforeAll(async () => {
    await db.resetDatabase();
  });

  afterEach(async () => {
    await db.resetDatabase();
  });

  describe("get index route", () => {
    describe("given an imageId that doesn't exist", () => {
      it("should return a 400 status and message", (done) => {
        request(app)
          .get(`/leaderboard/1`)
          .expect({ message: "The imageId you provided doesn't exist" })
          .expect(400, done);
      });
    });

    describe("given a valid imageId", () => {
      it("should return a 200 status and a leaderboard array", async () => {
        const image = await createImage();
        const { games } = await createLeaderboard(image.id);

        await request(app)
          .get(`/leaderboard/${image.id}`)
          .expect(games)
          .expect(200);
      });
    });
  });

  describe("post index route", () => {
    describe("given an invalid request body", () => {
      it("should return a 400 status and error message", async () => {
        const badPayloads = [
          {},
          { playerName: 111 },
          { playerName: "A" },
          { playerName: "AAAA" },
          { madeUpProperty: "AAA" },
        ];
        for (const payload of badPayloads) {
          await request(app)
            .post("/leaderboard/1")
            .send(payload)
            .expect({
              message:
                "Please provide a playerName that is exactly 3 characters",
            })
            .expect(400);
        }
      });
    });

    describe("given a gameId that doesn't exist", () => {
      it("should return a 400 status and error message", (done) => {
        request(app)
          .post(`/leaderboard/1`)
          .send({ playerName: "AAA" })
          .expect({ message: "The gameId you provided doesn't exist" })
          .expect(400, done);
      });
    });

    describe("given a game that has already been claimed", () => {
      it("should return a 403 status and error message", async () => {
        const image = await createImage();
        const game = await createGame(image.id, { isClaimed: true });

        await request(app)
          .post(`/leaderboard/${game.id}`)
          .send({ playerName: "AAA" })
          .expect({
            message: "This game has already been posted to the leaderboard",
          })
          .expect(403);
      });
    });

    describe("given a game that hasn't ended", () => {
      it("should return a 403 status and error message", async () => {
        const image = await createImage();
        const game = await createGame(image.id);

        await request(app)
          .post(`/leaderboard/${game.id}`)
          .send({ playerName: "AAA" })
          .expect({
            message: "This game has not been completed",
          })
          .expect(403);
      });
    });

    describe("given a valid game", () => {
      it("should return a 200 status, a message, and claim the game", async () => {
        const image = await createImage();
        const game = await createGame(image.id, { isEnded: true });
        const playerName = simpleFaker.string.alpha(3);
        await request(app)
          .post(`/leaderboard/${game.id}`)
          .send({ playerName })
          .expect({
            message: "Your score has been posted to the leaderboard.",
          })
          .expect(200);

        const updatedGame = await db.getGame(game.id);
        expect(updatedGame).toEqual({
          ...game,
          playerName: playerName.toUpperCase(),
          time: game.endTime - game.startTime,
        });
      });
    });
  });
});
