const gameRouter = require("../routes/gameRouter");

const request = require("supertest");
const express = require("express");

const app = express();

app.use(express.json());
app.use("/game", gameRouter);

const gameId = 1;

test("index route works", (done) => {
  request(app).get("/game").expect(200, done);
});

test("new game route works", (done) => {
  request(app).post("/game/new").send({ imageId: 1 }).expect(302, done);
});

test("game get route works", (done) => {
  request(app).get(`/game/${gameId}`).expect(200, done);
});

test("guess route works", (done) => {
  request(app)
    .post(`/game/${gameId}/guess`)
    .send({ characterId: 1, x: 1, y: 1 })
    .expect(302, done);
});
