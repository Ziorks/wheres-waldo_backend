const request = require("supertest");
const express = require("express");
const { notFoundHandler, errorHandler } = require("../middleware");
const { describe, it } = require("@jest/globals");

const errorMsg = "this is a test error";

const app = express();

app.get("/", (req, res) => {
  throw new Error(errorMsg);
});
app.use("*splat", notFoundHandler);
app.use(errorHandler);

describe("middleware", () => {
  describe("not found hadler", () => {
    describe("given an undefined route is requested", () => {
      it("should return a 404 status", (done) => {
        request(app).get("/any").expect(404, done);
      });
    });
  });

  describe("error hadler", () => {
    describe("given a route throws an unhandled error", () => {
      it("should return a 500 status and message containing the error", (done) => {
        request(app).get("/").expect(500, { message: errorMsg }, done);
      });
    });
  });
});
