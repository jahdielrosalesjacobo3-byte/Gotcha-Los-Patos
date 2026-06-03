#!/usr/bin/env node
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const {
  BOT_VERSION,
  classifyMessage,
  wantsPersonalAttention,
} = require("../api/lib/whatsapp-bot.js");

const cases = [
  { text: "quiero atencion personalizada", expect: "personal" },
  { text: "Quiero atención personalizada", expect: "personal" },
  { text: "necesito atencion personalizada por favor", expect: "personal" },
  { text: "asesor", expect: "personal" },
  { text: "hablar con alguien", expect: "personal" },
  { text: "hola", expect: "welcome" },
  { text: "precios", expect: "prices" },
  { text: "horarios", expect: "schedule" },
  { text: "ubicacion", expect: "location" },
  { text: "reservar", expect: "reserve" },
  { text: "estado", expect: "status" },
  { text: "xyz random", expect: "unknown" },
];

let failed = 0;

console.log(`Bot version: ${BOT_VERSION}\n`);

for (const { text, expect } of cases) {
  const route = classifyMessage(text);
  const personal = wantsPersonalAttention(text);
  const ok = route === expect;
  if (!ok) failed += 1;
  console.log(`${ok ? "✓" : "✗"} "${text}" → ${route} (personal=${personal})${ok ? "" : `, expected ${expect}`}`);
}

if (failed > 0) {
  console.error(`\n${failed} prueba(s) fallida(s).`);
  process.exit(1);
}

console.log(`\n${cases.length} pruebas OK.`);
