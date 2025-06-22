const indexRouter = require("../routes/indexRouter");

const request = require("supertest");
const express = require("express");

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use("/", indexRouter);

test("index route works", (done) => {
  request(app).get("/").expect(200, done);
});
