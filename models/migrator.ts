import { exec } from "node:child_process";
import { promisify } from "node:util";
import { resolve } from "node:path";

const execAsync = promisify(exec);

const MIGRATIONS_DIR = resolve("infra", "migrations");
const ENV_PATH = ".env.development";

function formatMigrationOutput(stdout: string) {
  if (stdout.includes("No migrations to run")) {
    return { status: "done", message: "Todas as migrations já foram aplicadas ✅" };
  }
  if (stdout.includes("Migrations complete")) {
    return { status: "pending", message: "⚠️ Existem migrations pendentes" };  
  }    
  return { status: "unknown", message: "Não foi possível determinar o status das migrations ❓", raw: stdout };
}

async function listPendingMigrations() {
  try {
    const { stdout, stderr } = await execAsync(
      `node-pg-migrate up -m ${MIGRATIONS_DIR} --envPath ${ENV_PATH} --dry-run`
    );

    if (stderr) {
      console.error(stderr);
    }

    return formatMigrationOutput(stdout);
  } catch (err) {
    console.error("Erro ao listar migrations:", err);
    throw err;
  }
}

async function runPendingMigrations() {
  try {
    const { stdout, stderr } = await execAsync(`npm run migrations:up`);

    if (stderr) {
      console.error(stderr);
    }

    return formatMigrationOutput(stdout);
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
