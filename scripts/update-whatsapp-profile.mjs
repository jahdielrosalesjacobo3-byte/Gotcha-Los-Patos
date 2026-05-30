#!/usr/bin/env node
/**
 * Actualiza foto y datos del perfil WhatsApp Business (Cloud API).
 *
 * Requiere:
 *   WHATSAPP_ACCESS_TOKEN
 *   WHATSAPP_PHONE_NUMBER_ID
 *   META_APP_ID (ID de la app en developers.facebook.com)
 *
 * Uso:
 *   node scripts/update-whatsapp-profile.mjs [ruta-imagen]
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GRAPH = "https://graph.facebook.com/v21.0";

const token = process.env.WHATSAPP_ACCESS_TOKEN;
const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
const appId = process.env.META_APP_ID || process.env.WHATSAPP_APP_ID;

const imagePath =
  process.argv[2] ||
  path.join(__dirname, "../frontend/public/whatsapp-profile.png");

if (!token || !phoneId || !appId) {
  console.error(
    "Faltan WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID o META_APP_ID",
  );
  process.exit(1);
}

if (!fs.existsSync(imagePath)) {
  console.error("Imagen no encontrada:", imagePath);
  process.exit(1);
}

const buffer = fs.readFileSync(imagePath);
const fileLength = buffer.length;
const fileType = imagePath.endsWith(".png") ? "image/png" : "image/jpeg";

async function uploadProfilePicture() {
  const sessionUrl = `${GRAPH}/${appId}/uploads?file_length=${fileLength}&file_type=${encodeURIComponent(fileType)}`;
  const sessionRes = await fetch(sessionUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const sessionData = await sessionRes.json();
  if (!sessionRes.ok) {
    throw new Error(`Upload session: ${JSON.stringify(sessionData)}`);
  }

  const sessionId = sessionData.id;
  const uploadRes = await fetch(`${GRAPH}/${sessionId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      file_offset: "0",
      "Content-Type": "application/octet-stream",
    },
    body: buffer,
  });
  const uploadData = await uploadRes.json();
  if (!uploadRes.ok) {
    throw new Error(`Upload binary: ${JSON.stringify(uploadData)}`);
  }

  return uploadData.h;
}

async function updateProfile(handle) {
  const body = {
    messaging_product: "whatsapp",
    about: "Paintball táctico en La Marquesa 🎯",
    description:
      "Gotcha Los Patos La Marquesa — la mejor experiencia de paintball en el bosque, a 30 min de la CDMX. Reserva en línea con anticipo de $300 MXN.",
    address: "Gotcha Los Patos, 52743 La Marquesa, Estado de México, México",
    email: "gotchalospatos351@gmail.com",
    websites: ["https://www.gotchalospatos.xyz"],
    vertical: "ENTERTAIN",
    profile_picture_handle: handle,
  };

  const res = await fetch(`${GRAPH}/${phoneId}/whatsapp_business_profile`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Update profile: ${JSON.stringify(data)}`);
  }
  return data;
}

try {
  console.log("Subiendo foto de perfil...");
  const handle = await uploadProfilePicture();
  console.log("Handle:", handle);
  console.log("Actualizando perfil de negocio...");
  const result = await updateProfile(handle);
  console.log("Perfil actualizado:", JSON.stringify(result, null, 2));
} catch (err) {
  console.error("Error:", err.message);
  process.exit(1);
}
