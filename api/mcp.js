// api/mcp.js

export const config = {
  runtime: "nodejs"
};

import { FastMCP } from "fastmcp";
import { kv } from "@vercel/kv";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// ✅ 구버전 fastmcp 스타일: createServer() X, new FastMCP() O
const server = new FastMCP({
  transports: ["http"]
});

// ------------------------------
// Redis(Vercel KV) SET
// ------------------------------
server.tool("redis_set", {
  description: "Set a value in Vercel KV (Redis 기반)",
  input: {
    key: "string",
    value: "string"
  },
  execute: async ({ key, value }) => {
    await kv.set(key, value);
    return { status: "ok" };
  }
});

// ------------------------------
// Redis(Vercel KV) GET
// ------------------------------
server.tool("redis_get", {
  description: "Get a value from Vercel KV (Redis 기반)",
  input: {
    key: "string"
  },
  execute: async ({ key }) => {
    const value = await kv.get(key);
    return value;
  }
});

// ------------------------------
// 이메일 전송
// ------------------------------
server.tool("email_send", {
  description: "Send email via Resend",
  input: {
    to: "string",
    subject: "string",
    body: "string"
  },
  execute: async ({ to, subject, body }) => {
    await resend.emails.send({
      from: "MCP Server <no-reply@example.com>",
      to,
      subject,
      html: `<pre>${body}</pre>`
    });

    return { status: "sent" };
  }
});

// ------------------------------
// Vercel Serverless handler
// ------------------------------
export default async function handler(req, res) {
  return server.handleNodeRequest(req, res);
}
