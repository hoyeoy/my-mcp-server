export const config = {
  runtime: "nodejs"
};

import { FastMCP } from "fastmcp";
import { kv } from "@vercel/kv";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// FastMCP 구버전: createServer 사용 ❌ / new FastMCP() 사용 ⭕
const server = new FastMCP({
  transports: ["http"]
});

// ------------------------------
// KV 저장
// ------------------------------
server.tool("kv_put", {
  description: "Store data into Vercel KV",
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
// KV 읽기
// ------------------------------
server.tool("kv_get", {
  description: "Get data from Vercel KV",
  input: {
    key: "string"
  },
  execute: async ({ key }) => {
    return await kv.get(key);
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
// Vercel Serverless Handler
// ------------------------------
export default async function handler(req, res) {
  // FastMCP 구버전은 handleNodeRequest를 사용
  return server.handleNodeRequest(req, res);
}
