import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  // CORS 허용
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const { key, value } = req.body || {};

  if (!key || value === undefined) {
    return res.status(400).json({ error: "key와 value가 필요합니다." });
  }

  await kv.set(key, value);
  return res.json({ status: "ok" });
}

export const config = { api: { bodyParser: true } };
