import database from "infra/database";
import password from "models/password";
import { NotFoundError, ValidationError } from "infra/errors";

interface User {
  id?: number;
  username: string;
  email: string;
  password: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

interface UserInput {
  username: string;
  email: string;
  password: string;
  [key: string]: any;
}

async function create(usersInputValues: UserInput): Promise<User> {
  await validateUniqueEmail(usersInputValues.email);
  await validateUniqueUsername(usersInputValues.username);
  await hashPasswordInObject(usersInputValues);
  const newUser = await runInsertQuery(usersInputValues);
  return newUser;

  async function runInsertQuery(usersInputValues: UserInput): Promise<User> {
    const result = await database.query({
      text: `
        INSERT INTO users (username, email, password)
        VALUES ($1, $2, $3)
        RETURNING *;
      `,
      values: [usersInputValues.username, usersInputValues.email, usersInputValues.password],
    });
    return result.rows[0];
  }
}

async function findOneById(id: number): Promise<User> {
  const userFound = await runSelectQuery(id);
  return userFound;

  async function runSelectQuery(id: number): Promise<User> {
    const result = await database.query({
      text: `SELECT * FROM users WHERE id = $1 LIMIT 1;`,
      values: [id],
    });
    if (result.rowCount === 0) {
      throw new NotFoundError({
        message: "O id informado não foi encontrado no sistema",
        action: "Verifique se o id está digitado corretamente",
      });
    }
    return result.rows[0];
  }
}

async function findOneByUsername(username: string): Promise<User> {
  const userFound = await runSelectQuery(username);
  return userFound;

  async function runSelectQuery(username: string): Promise<User> {
    const result = await database.query({
      text: `SELECT * FROM users WHERE LOWER(username) = LOWER($1) LIMIT 1;`,
      values: [username],
    });
    if (result.rowCount === 0) {
      throw new NotFoundError({
        message: "O username informado não foi encontrado no sistema",
        action: "Verifique se o username está digitado corretamente",
      });
    }
    return result.rows[0];
  }
}

async function findOneByEmail(email: string): Promise<User> {
  const userFound = await runSelectQuery(email);
  return userFound;

  async function runSelectQuery(email: string): Promise<User> {
    const result = await database.query({
      text: `SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1;`,
      values: [email],
    });
    if (result.rowCount === 0) {
      throw new NotFoundError({
        message: "O email informado não foi encontrado no sistema",
        action: "Verifique se o email está digitado corretamente",
      });
    }
    return result.rows[0];
  }
}

async function validateUniqueUsername(username: string): Promise<User | undefined> {
  const result = await database.query({
    text: `SELECT username FROM users WHERE LOWER(username) = LOWER($1) LIMIT 1;`,
    values: [username],
  });
  if (result.rowCount > 0) {
    throw new ValidationError({
      message: "Username ja existe",
      action: "Escolha outro username",
    });
  }
  return result.rows[0];
}

async function validateUniqueEmail(email: string): Promise<User | undefined> {
  const result = await database.query({
    text: `SELECT email FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1;`,
    values: [email],
  });
  if (result.rowCount > 0) {
    throw new ValidationError({
      message: "Email ja existe",
      action: "Escolha outro email",
    });
  }
  return result.rows[0];
}

async function hashPasswordInObject(usersInputValues: UserInput): Promise<void> {
  const passwordHash = await password.hash(usersInputValues.password);
  usersInputValues.password = passwordHash;
}

async function update(username: string, userInputValues: Partial<UserInput>): Promise<User> {
  const currentUser = await findOneByUsername(username);

  if ("email" in userInputValues) {
    await validateUniqueEmail(userInputValues.email!);
  }

  if ("username" in userInputValues) {
    if (currentUser.username.toLowerCase() !== userInputValues.username!.toLowerCase()) {
      await validateUniqueUsername(userInputValues.username!);
    }
  }

  if ("password" in userInputValues) {
    await hashPasswordInObject(userInputValues as UserInput);
  }

  const userWithNewValues = { ...currentUser, ...userInputValues };
  const updatedUser = await runUpdateQuery(userWithNewValues, userInputValues);
  return updatedUser;

  async function runUpdateQuery(userWithNewValues: User, userInputValues: Partial<UserInput>): Promise<User> {
    const result = await database.query({
      text: `
        UPDATE users
        SET username = $2,
            email = $3,
            password = $4,
            updated_at = timezone('utc', now())
        WHERE id = $1
        RETURNING *;
      `,
      values: [
        userWithNewValues.id,
        userWithNewValues.username,
        userInputValues.email,
        userInputValues.password,
      ],
    });
    return result.rows[0];
  }
}

const user = {
  create,
  findOneById,
  findOneByUsername,
  findOneByEmail,
  update,
};

export default user;
