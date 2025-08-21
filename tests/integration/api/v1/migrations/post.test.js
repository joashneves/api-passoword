import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
});

describe("POST to /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    describe("Running pendin migrations", () => {
      test("for the first time", async () => {
        const response = await fetch(
          "http://localhost:3000/api/v1/migrations",
          {
            method: "POST",
          },
        );
        expect(response.status).toBe(201);

        const responseBody = await response.json();
        expect(Array.isArray(responseBody)).toBe(true);
      });
      test("for the second time", async () => {
        const responseGet = await fetch(
          "http://localhost:3000/api/v1/migrations",
        );
        expect(responseGet.status).toBe(200);

        const responseGetBody = await responseGet.json();
        expect(Array.isArray(responseGetBody)).toBe(true);
        expect(responseGetBody.length).toBe(0);
      });
    });
  });
});