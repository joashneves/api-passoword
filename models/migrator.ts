// models/migrator.ts
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { resolve } from "node:path";

const execAsync = promisify(exec);

const MIGRATIONS_DIR = resolve("infra", "migrations");
const ENV_PATH = ".env.development";

async function listPendingMigrations(): Promise<string> {
  try {
    const { stdout, stderr } = await execAsync(
      `npm run migrations:up`
    );

    if (stderr) {
      console.error(stderr);
    }

    return stdout;
  } catch (err) {
    console.error("Erro ao listar migrations:", err);
    throw err;
  }
}

async function runPendingMigrations(): Promise<string> {
  try {
    const { stdout, stderr } = await execAsync(
      `npm run migrations:up`
    );

    if (stderr) {
      console.error(stderr);
    }

    return stdout;
  } catch (err) {
    console.error("Erro ao rodar migrations:", err);
    throw err;
  }
}

const migrator = {
  listPendingMigrations,
  runPendingMigrations,
};

export default migrator;
