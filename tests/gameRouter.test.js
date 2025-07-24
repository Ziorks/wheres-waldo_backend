const gameRouter = require("../routes/gameRouter");

const request = require("supertest");
const express = require("express");
const { describe, it, beforeAll, expect, afterEach } = require("@jest/globals");
const db = require("../db/queries");
const { createImage, createCharacter } = require("./utils/helperFunctions");

const app = express();

app.use(express.json());
app.use("/game", gameRouter);

describe("/game", () => {
  beforeAll(async () => {
    await db.resetDatabase();
  });

  afterEach(async () => {
    await db.resetDatabase();
  });

  describe("get index route", () => {
    it("should return a 200 status and an array of all images in the database", async () => {
      const images = [];
      for (let i = 0; i < Math.random() * 10 + 1; i++) {
        const image = await createImage();
        delete image.vector2dId;
        delete image.percentGuessTolerance;
        images.push(image);
      }

      const { body, statusCode } = await request(app).get("/game");
      expect(body).toEqual(images);
      expect(statusCode).toBe(200);
    });
  });

  describe("get game route", () => {
    describe("given the game doesn't exist", () => {
      it("should return a 404 status", (done) => {
        request(app).get("/game/1").expect(404, done);
      });
    });

    describe("given the game does exist", () => {
      it("should return a 200 status and the game", async () => {
        const image = await createImage();
        delete image.vector2dId;
        const character = await createCharacter(image);
        delete character.imageId;
        delete character.vector2dId;
        delete character.location;
        const game = await db.createGame(image.id);
        await db.createObjectives(game.id, [{ characterId: character.id }]);

        const { statusCode, body } = await request(app).get(`/game/${game.id}`);

        expect(statusCode).toBe(200);
        expect(body).toEqual(
          expect.objectContaining({
            endTime: null,
            id: game.id,
            image,
            nGuesses: 0,
            objectives: [{ found: false, character }],
            playerName: null,
            startTime: game.startTime.toISOString(),
            time: null,
          })
        );
      });
    });
  });

  describe("create game route", () => {
    describe("given an invalid imageId", () => {
      it("should return a 400 status and error message", (done) => {
        request(app)
          .post("/game/new")
          .send({ imageId: undefined })
          .expect("Content-Type", /json/)
          .expect({ message: "Invalid imageId" })
          .expect(400, done);
      });
    });

    describe("given a valid imageId", () => {
      it("should return a 302 status, redirect to GET /game/:gameId, and create a game", async () => {
        const image = await createImage();
        delete image.vector2dId;
        const characters = [];
        for (let i = 0; i < 3; i++) {
          const character = await createCharacter(image);
          delete character.imageId;
          delete character.location;
          delete character.vector2dId;
          characters.push(character);
        }
        const { headers } = await request(app)
          .post("/game/new")
          .send({ imageId: image.id })
          .expect("Location", /\/game\/[0-9]+/)
          .expect(302);

        const { body } = await request(app).get(headers.location);
        expect(body).toEqual(
          expect.objectContaining({
            id: expect.any(Number),
            startTime: expect.any(String),
            endTime: null,
            nGuesses: 0,
            playerName: null,
            time: null,
            objectives: [
              { found: false, character: characters[0] },
              { found: false, character: characters[1] },
              { found: false, character: characters[2] },
            ],
            image,
          })
        );
      });
    });
  });

  describe("guess route", () => {
    let image, characters, game;
    beforeEach(async () => {
      image = await createImage();
      characters = [];
      for (let i = 0; i < 3; i++) {
        const character = await createCharacter(image);
        characters.push(character);
      }
      const characterIds = characters.map((character) => ({
        characterId: character.id,
      }));
      game = await db.createGame(image.id);
      await db.createObjectives(game.id, characterIds);
    });

    describe("given a guess on a game that doesn't exist", () => {
      it("should return a 400 status and error message", (done) => {
        request(app)
          .post(`/game/${game.id + 1}/guess`)
          .send({ characterId: characters[0].id, x: 1, y: 1 })
          .expect({ message: "That gameId doesn't exist" })
          .expect(400, done);
      });
    });

    describe("given an improperly formatted guess", () => {
      it("should return a 400 status and error message", async () => {
        const invalidGuesses = [
          {},
          { characterId: 1 },
          { x: 1 },
          { y: 1 },
          { characterId: 1, x: 1 },
          { characterId: 1, y: 1 },
          { x: 1, y: 1 },
          { characterId: "1", x: 1, y: 1 },
          { characterId: 1, x: "1", y: 1 },
          { characterId: 1, x: 1, y: "1" },
        ];
        for (guess of invalidGuesses) {
          await request(app)
            .post(`/game/${game.id}/guess`)
            .send(guess)
            .expect({
              message:
                "Body shoud be: { characterId:Integer, xGuess:Integer, yGuess:Integer }",
            })
            .expect(400);
        }
      });
    });

    describe("given a guess with an invalid characterId", () => {
      it("should return a 400 status and error message", (done) => {
        const badCharacterId = characters.reduce(
          (prev, cur) => prev + cur.id,
          0
        );

        request(app)
          .post(`/game/${game.id}/guess`)
          .send({ characterId: badCharacterId, x: 1, y: 1 })
          .expect({ message: "Invalid characterId" })
          .expect(400, done);
      });
    });

    describe("given a guess with one or more out of coordinates out of image bounds", () => {
      it("should return a 400 status and error message", async () => {
        const invalidGuesses = [
          { characterId: characters[0].id, x: image.width + 1000, y: 1 }, //x out of image bounds
          { characterId: characters[0].id, x: 1, y: -1000 }, //y out of image bounds
          { characterId: characters[0].id, x: -1000, y: image.height + 1000 }, //x and y out of image bounds
        ];
        for (guess of invalidGuesses) {
          await request(app)
            .post(`/game/${game.id}/guess`)
            .send(guess)
            .expect({ message: "Guess coordinates out of image bounds" })
            .expect(400);
        }
      });
    });

    describe("given a guess on a game that has ended", () => {
      it("should return a 403 status and error message", async () => {
        await db.updateGame(game.id, { endTime: new Date() });
        await request(app)
          .post(`/game/${game.id}/guess`)
          .send({ characterId: characters[0].id, x: 1, y: 1 })
          .expect({ message: "The game has ended" })
          .expect(403);

        await db.updateGame(game.id, { endTime: null });
      });
    });

    describe("given a valid guess", () => {
      it("should return a 302 status and redirect to GET /game/:gameId", (done) => {
        request(app)
          .post(`/game/${game.id}/guess`)
          .send({
            characterId: characters[0].id,
            x: characters[0].location.x,
            y: characters[0].location.y,
          })
          .expect("Location", `/game/${game.id}`)
          .expect(302, done);
      });
    });

    describe("given a correct guess", () => {
      it("should update the appropriate objective", async () => {
        await request(app).post(`/game/${game.id}/guess`).send({
          characterId: characters[0].id,
          x: characters[0].location.x,
          y: characters[0].location.y,
        });

        const { body } = await request(app).get(`/game/${game.id}`);
        delete image.vector2dId;
        for (const character of characters) {
          delete character.imageId;
          delete character.vector2dId;
        }
        delete characters[1].location;
        delete characters[2].location;
        expect(body).toEqual(
          expect.objectContaining({
            id: game.id,
            startTime: expect.any(String),
            endTime: null,
            nGuesses: 1,
            playerName: null,
            time: null,
            objectives: [
              { found: true, character: characters[0] },
              { found: false, character: characters[1] },
              { found: false, character: characters[2] },
            ],
            image,
          })
        );
      });
    });

    describe("given all objectives are guessed correctly", () => {
      it("should end the game", async () => {
        for (const character of characters) {
          await request(app).post(`/game/${game.id}/guess`).send({
            characterId: character.id,
            x: character.location.x,
            y: character.location.y,
          });
          delete character.imageId;
          delete character.vector2dId;
        }
        const { body } = await request(app).get(`/game/${game.id}`);
        delete image.vector2dId;
        expect(body).toEqual(
          expect.objectContaining({
            id: game.id,
            startTime: expect.any(String),
            endTime: expect.any(String),
            nGuesses: 3,
            playerName: null,
            time: null,
            objectives: [
              { found: true, character: characters[0] },
              { found: true, character: characters[1] },
              { found: true, character: characters[2] },
            ],
            image,
          })
        );
      });
    });
  });
});
