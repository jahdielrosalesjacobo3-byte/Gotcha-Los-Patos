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

const sqlPath = path.join(__dirname, "../migrations/001_initial_schema.sql");
const sql = fs.readFileSync(sqlPath, "utf8");

const rawUrl = databaseUrl.replace(/[?&]sslmode=[^&]*/g, "").replace(/\?$/, "");
const client = new pg.Client({
  connectionString: rawUrl,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(sql);
  console.log("Migración aplicada correctamente.");
} catch (err) {
  console.error("Error aplicando migración:", err.message);
  process.exit(1);
} finally {
  await client.end();
}
