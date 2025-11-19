import { FastMCP } from "fastmcp";
import { kv } from "@vercel/kv";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  const server = new FastMCP({
    transports: ["http"]
  });

  // 예: GPT들이 크롤링 데이터 저장
  server.tool("kv_put", {
    description: "Store data into KV",
    input: {
      key: "string",
      value: "string"
    },
    execute: async ({ key, value }) => {
      await kv.set(key, value);
      return { status: "ok" };
    }
  });

  // 데이터 가져오기
  server.tool("kv_get", {
    description: "Get data from KV",
    input: {
      key: "string"
    },
    execute: async ({ key }) => {
      return await kv.get(key);
    }
  });

  // 이메일 보내기
  server.tool("email_send", {
    description: "Send email",
    input: {
      to: "string",
      subject: "string",
      body: "string"
    },
    execute: async ({ to, subject, body }) => {
      await resend.emails.send({
        from: "MCP Server <no-reply@yourdomain.com>",
        to,
        subject,
        html: `<pre>${body}</pre>`
      });

      return { status: "sent" };
    }
  });

  await server.handleNodeRequest(req, res);
}
