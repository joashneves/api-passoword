import crypto from "node:crypto";
import database from "infra/database";
import { UnauthorizedError } from "infra/errors";
import { QueryResult } from "pg";

// Interface para uma sessão
export interface Session {
  id: number;
  token: string;
  user_id: number;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
}

const EXPIRATION_IN_MILLISECONDS = 60 * 60 * 24 * 30 * 1000; // 30 dias

async function findOneValidByToken(sessionToken: string): Promise<Session> {
  const sessionFound = await runSelectQuery(sessionToken);
  return sessionFound;

  async function runSelectQuery(sessionToken: string): Promise<Session> {
    const results: QueryResult<Session> = await database.query({
      text: `
        SELECT
          *
        FROM
          sessions
        WHERE
          token = $1
          AND expires_at > NOW()
        LIMIT
          1
      ;`,
      values: [sessionToken],
    });

    if (results.rowCount === 0) {
      throw new UnauthorizedError({
        message: "Usuário não possui sessão ativa.",
        action: "Verifique se este usuário está logado e tente novamente.",
      });
    }

    return results.rows[0];
  }
}

async function create(userId: number): Promise<Session> {
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

  const newSession = await runInsertQuery(token, userId, expiresAt);
  return newSession;

  async function runInsertQuery(
    token: string,
    userId: number,
    expiresAt: Date
  ): Promise<Session> {
    const results: QueryResult<Session> = await database.query({
      text: `
        INSERT INTO
          sessions (token, user_id, expires_at)
        VALUES
          ($1, $2, $3)
        RETURNING
          *
      ;`,
      values: [token, userId, expiresAt],
    });

    return results.rows[0];
  }
}

async function renew(sessionId: number): Promise<Session> {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

  const renewedSessionObject = await runUpdateQuery(sessionId, expiresAt);
  return renewedSessionObject;

  async function runUpdateQuery(
    sessionId: number,
    expiresAt: Date
  ): Promise<Session> {
    const results: QueryResult<Session> = await database.query({
      text: `
        UPDATE
          sessions
        SET
          expires_at = $2,
          updated_at = NOW()
        WHERE
          id = $1
        RETURNING
          *
        ;`,
      values: [sessionId, expiresAt],
    });

    return results.rows[0];
  }
}

async function expireById(sessionId: number): Promise<Session> {
  const expiredSessionObject = await runUpdateQuery(sessionId);
  return expiredSessionObject;

  async function runUpdateQuery(sessionId: number): Promise<Session> {
    const results: QueryResult<Session> = await database.query({
      text: `
        UPDATE
          sessions
        SET
          expires_at = expires_at - interval '1 year',
          updated_at = NOW()
        WHERE
          id = $1
        RETURNING
          *
        ;`,
      values: [sessionId],
    });

    return results.rows[0];
  }
}

const session = {
  create,
  findOneValidByToken,
  renew,
  expireById,
  EXPIRATION_IN_MILLISECONDS,
};

export default session;
