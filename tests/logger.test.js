
import request from "supertest";
import { describe, test, expect } from "@jest/globals";
import app from "../src/app.js";

describe("Logger API - Preentrega 4", () => {
  test("GET /api/logger-test debe responder HTTP 200", async () => {
    const response = await request(app).get("/api/logger-test");

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });
});