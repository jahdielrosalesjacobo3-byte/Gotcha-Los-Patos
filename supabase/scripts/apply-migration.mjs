#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const databaseUrl =
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("Falta POSTGRES_URL_NON_POOLING o DATABASE_URL");
  process.exit(1);
}

const migrationsDir = path.join(__dirname, "../migrations");
const files = fs
  .readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

const rawUrl = databaseUrl.replace(/[?&]sslmode=[^&]*/g, "").replace(/\?$/, "");
const client = new pg.Client({
  connectionString: rawUrl,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    console.log(`Aplicando ${file}...`);
    await client.query(sql);
  }
  console.log("Migraciones aplicadas correctamente.");
} catch (err) {
  console.error("Error aplicando migración:", err.message);
  process.exit(1);
} finally {
  await client.end();
}
