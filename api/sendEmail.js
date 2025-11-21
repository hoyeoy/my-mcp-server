import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // CORS 허용
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const { to, subject, body } = req.body || {};

  if (!to || !subject || !body) {
    return res.status(400).json({ error: "to, subject, body가 필요합니다." });
  }

  await resend.emails.send({
    from: "MCP Server <onboarding@resend.dev>",
    to,
    subject,
    html: `<pre>${body}</pre>`,
  });

  return res.json({ status: "sent" });
}

export const config = { api: { bodyParser: true } };
