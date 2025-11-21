// api/mcp.js  ← 이 파일 하나만 교체하고 git push 하면 끝!
/*
import { kv } from "@vercel/kv";
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // CORS 허용
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const { tool_calls } = req.body || {};

  if (!Array.isArray(tool_calls)) {
    return res.status(400).json({ error: "tool_calls 배열 필요" });
  }

  const tool_results = [];

  for (const call of tool_calls) {
    const { name, arguments: args } = call;

    if (name === "kv_put" && args?.key && args?.value !== undefined) {
      await kv.set(args.key, args.value);
      tool_results.push({ name, result: { status: "ok" } });

    } else if (name === "kv_get" && args?.key) {
      const value = await kv.get(args.key);
      tool_results.push({ name, result: value });

    } else if (name === "email_send" && args?.to && args?.subject && args?.body) {
      await resend.emails.send({
        from: "MCP Server <onboarding@resend.dev>",
        to: args.to,
        subject: args.subject,
        html: `<pre>${args.body}</pre>`,
      });
      tool_results.push({ name, result: { status: "sent" } });

    } else {
      tool_results.push({ name, result: null, error: "Invalid call" });
    }
  }

  return res.json({ tool_results });
}

// 이거만 있으면 raw body 잘 읽음
export const config = { api: { bodyParser: true } };
*/