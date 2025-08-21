import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";
import user from "models/user";
import password from "models/password";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

xdescribe("POST to /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With unique and valid data", async () => {
      /*       await database.query({
          text:'INSERT INTO users (username, email, password) VALUES ($1, $2, $3);',
           values: ["joashneves", "joashneves@gmail.com", "senhagenerica"],});
*/
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "joashneves",
          email: "joashneves@s3nha.com",
          password: "senhagenerica",
        }),
      });
      expect(response1.status).toBe(201);

      const responseBody = await response1.json();
      console.log(responseBody);
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "joashneves",
        email: "joashneves@s3nha.com",
        password: responseBody.password,
        role: responseBody.role,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const userInDatabase = await user.findOneByUsername("joashneves");
      const correcpPasswordMatch = await password.compare(
        "senhagenerica",
        userInDatabase.password,
      );
      expect(correcpPasswordMatch).toBe(true);

      const incorrecpPasswordMatch = await password.compare(
        "senhagenericaerrada",
        userInDatabase.password,
      );
      expect(incorrecpPasswordMatch).toBe(false);
    });

    test("With duplicated 'email' and invalid data", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "emailduplicado1",
          email: "duplicado@s3nha.com",
          password: "senhagenerica",
        }),
      });
      expect(response.status).toBe(201);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "emailduplicado1",
        email: "duplicado@s3nha.com",
        password: responseBody.password,
        role: responseBody.role,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "emailduplicado2",
          email: "Duplicado@s3nha.com",
          password: "senhagenerica",
        }),
      });
      expect(response2.status).toBe(409);
      const responseBody2 = await response2.json();
      expect(responseBody2).toEqual({
        name: "ValidationError",
        message: "Email ja existe",
        action: "Escolha outro email",
        status_code: 409,
      });
    });

    test("With duplicated 'username' and invalid data", async () => {
      const response4 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "userduplicado",
          email: "emails@s3nha.com",
          password: "senha123",
        }),
      });
      expect(response4.status).toBe(201);

      const responseBody4 = await response4.json();
      expect(responseBody4).toEqual({
        id: responseBody4.id,
        username: "userduplicado",
        email: "emails@s3nha.com",
        password: responseBody4.password,
        role: responseBody4.role,
        created_at: responseBody4.created_at,
        updated_at: responseBody4.updated_at,
      });
      expect(uuidVersion(responseBody4.id)).toBe(4);
      expect(Date.parse(responseBody4.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody4.updated_at)).not.toBeNaN();

      const response3 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "userduplicado",
          email: "email@s3nha.com",
          password: "senhagenerica",
        }),
      });
      expect(response3.status).toBe(409);
      const responseBody3 = await response3.json();
      expect(responseBody3).toEqual({
        name: "ValidationError",
        message: "Username ja existe",
        action: "Escolha outro username",
        status_code: 409,
      });
    });
  });
});
