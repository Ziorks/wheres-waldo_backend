const request = require("supertest");
const express = require("express");
const { notFoundHandler, errorHandler } = require("../middleware");

const errorMsg = "this is a test error";

const app = express();

app.get("/", (req, res) => {
  throw new Error(errorMsg);
});
app.use("*splat", notFoundHandler);
app.use(errorHandler);

test("not found works", (done) => {
  request(app).get("/any").expect(404, done);
});

test("error works", (done) => {
  request(app).get("/").expect(500, { message: errorMsg }, done);
});
