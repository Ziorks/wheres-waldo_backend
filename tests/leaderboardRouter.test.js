const leaderboardRouter = require("../routes/leaderboardRouter");

const request = require("supertest");
const express = require("express");

const app = express();

app.use("/leaderboard", leaderboardRouter);

const imageId = 1;
const gameId = 1;

test("get route works", (done) => {
  request(app).get(`/leaderboard/${imageId}`).expect(200, done);
});

test("post route works", (done) => {
  request(app).post(`/leaderboard/${gameId}`).expect(200, done);
});
