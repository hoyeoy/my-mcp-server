/*import { Resend } from "resend";
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

export const config = { api: { bodyParser: true } };*/
// api/mcp.js (또는 api/email.js 등 당신이 쓰는 파일)

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

  // ------------------ to 검증 & 배열 변환 ------------------
  let toArray = [];

  if (typeof to === "string" && to.trim() !== "") {
    toArray = [to.trim()];
  } else if (Array.isArray(to)) {
    toArray = to
      .map(email => typeof email === "string" ? email.trim() : null)
      .filter(email => email && email.includes("@"));
  }

  if (toArray.length === 0) {
    return res.status(400).json({ error: "유효한 이메일 주소(to)가 필요합니다." });
  }

  if (!subject || !body) {
    return res.status(400).json({ error: "subject와 body가 필요합니다." });
  }

  // ------------------ 이메일 발송 ------------------
  try {
    await resend.emails.send({
      from: "MCP Server <onboarding@resend.dev>",
      to: toArray,                    // ← 여기서 배열도 그대로 넣어줌 (Resend 완벽 지원)
      subject: subject.trim(),
      html: `<pre>${body}</pre>`,
    });

    return res.json({
      status: "sent",
      recipients: toArray,
      count: toArray.length
    });
  } catch (error) {
    return res.status(500).json({
      error: "이메일 전송 실패",
      details: error.message
    });
  }
}

export const config = { api: { bodyParser: true } };
