export const config = {
  runtime: "nodejs20.x"
};

import { createServer } from "fastmcp";
import { kv } from "@vercel/kv";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const server = createServer({
  transports: ["http"],

  tools: {
    // KV 저장
    kv_put: {
      description: "Store data into Vercel KV",
      input: {
        key: "string",
        value: "string"
      },
      execute: async ({ key, value }) => {
        await kv.set(key, value);
        return { status: "ok" };
      }
    },

    // KV 읽기
    kv_get: {
      description: "Get data from Vercel KV",
      input: {
        key: "string"
      },
      execute: async ({ key }) => {
        return await kv.get(key);
      }
    },

    // 이메일 보내기
    email_send: {
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
    }
  }
});

export default server;
