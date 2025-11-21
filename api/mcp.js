// api/mcp.js

import { FastMCP } from "fastmcp";  // npm i fastmcp
import { z } from "zod";  // npm i zod (스키마 검증용)
import { kv } from "@vercel/kv";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// FastMCP 서버 생성 (JS 버전 – name/version 필수)
const server = new FastMCP({
  name: "My MCP Server",
  version: "1.0.0",
  transports: ["http"]  // HTTP 전송 지원
});

// ------------------ 도구 등록: server.addTool() 사용 (tool() 아님!) ------------------
server.addTool({
  name: "kv_put",
  description: "Store data into Vercel KV",
  parameters: z.object({  // Zod 스키마 (필수 – Standard Schema 준수)
    key: z.string(),
    value: z.string()
  }),
  execute: async (args) => {
    await kv.set(args.key, args.value);
    return { status: "ok" };
  }
});

server.addTool({
  name: "kv_get",
  description: "Get data from Vercel KV",
  parameters: z.object({
    key: z.string()
  }),
  execute: async (args) => {
    return await kv.get(args.key);
  }
});

server.addTool({
  name: "email_send",
  description: "Send email via Resend",
  parameters: z.object({
    to: z.string().email(),
    subject: z.string(),
    body: z.string()
  }),
  execute: async (args) => {
    await resend.emails.send({
      from: "MCP Server <onboarding@resend.dev>",  // 테스트용 – 도메인 인증 추천
      to: args.to,
      subject: args.subject,
      html: `<pre>${args.body}</pre>`
    });
    return { status: "sent" };
  }
});

// ------------------ Vercel 핸들러 ------------------
export default async function handler(req, res) {
  // CORS 헤더 (MCP 클라이언트 호환)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  // FastMCP HTTP 핸들러 위임 (JS 버전 자동 처리)
  return server.handleNodeRequest(req, res);
}

export const config = {
  api: {
    bodyParser: false  // MCP raw body 필요
  }
};