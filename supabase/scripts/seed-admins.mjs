#!/usr/bin/env node
/**
 * Crea usuarios admin en Supabase Auth (idempotente).
 * Requiere: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

const url = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Faltan SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admins = [
  {
    email: "gotchalospatos351@gmail.com",
    password: process.env.ADMIN_PASSWORD || "GotchaLosPatos376",
    user_metadata: { role: "admin", name: "Admin" },
  },
  {
    email: "adminglp2026@staff.local",
    password: process.env.STAFF_PASSWORD || "GotchaLosPatos0126",
    user_metadata: { role: "admin", username: "AdminGLP2026", name: "Personal" },
  },
];

async function listUsers() {
  const res = await fetch(`${url}/auth/v1/admin/users?per_page=200`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.users || [];
}

async function createUser(user) {
  const res = await fetch(`${url}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...user,
      email_confirm: true,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    if (text.includes("already been registered")) return "exists";
    throw new Error(text);
  }
  return "created";
}

async function ensureProfile(userId, { email, username, name }) {
  const res = await fetch(`${url}/rest/v1/profiles`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({
      id: userId,
      email,
      username: username || null,
      role: "admin",
      name,
    }),
  });
  if (!res.ok) {
    const patch = await fetch(`${url}/rest/v1/profiles?id=eq.${userId}`, {
      method: "PATCH",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        username: username || null,
        role: "admin",
        name,
      }),
    });
    if (!patch.ok) throw new Error(await patch.text());
  }
}

const existing = await listUsers();

for (const admin of admins) {
  const found = existing.find((u) => u.email?.toLowerCase() === admin.email.toLowerCase());
  if (found) {
    await ensureProfile(found.id, {
      email: admin.email,
      username: admin.user_metadata.username,
      name: admin.user_metadata.name,
    });
    console.log(`OK (existente): ${admin.email}`);
    continue;
  }
  const status = await createUser(admin);
  const users = await listUsers();
  const created = users.find((u) => u.email?.toLowerCase() === admin.email.toLowerCase());
  if (created) {
    await ensureProfile(created.id, {
      email: admin.email,
      username: admin.user_metadata.username,
      name: admin.user_metadata.name,
    });
  }
  console.log(`${status}: ${admin.email}`);
}

console.log("Seed de admins completado.");
