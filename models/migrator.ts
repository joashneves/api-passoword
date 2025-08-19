import  { RunnerOption } from "node-pg-migrate";
import { resolve } from "node:path";
import { Client } from "pg";
import database from "infra/database.js";

// opções padrão do runner
const defaultMigrationOptions: RunnerOption = {
  dryRun: true,
  dir: resolve("infra", "migrations"),
  direction: "up",
  log: () => {},
  verbose: true,
  migrationsTable: "pgmigrations",
};

async function listPendingMigrations(): Promise<string[]> {
  let dbClient: Client | undefined;

  try {
    dbClient = await database.getNewClient();

    const pendingMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient,
    });

    return pendingMigrations;
  } finally {
    await dbClient?.end();
  }
}

async function runPendingMigrations(): Promise<string[]> {
  let dbClient: Client | undefined;

  try {
    dbClient = await database.getNewClient();

    const migratedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient,
      dryRun: false,
    });

    return migratedMigrations;
  } finally {
    await dbClient?.end();
  }
}

const migrator = {
  listPendingMigrations,
  runPendingMigrations,
};

export default migrator;
