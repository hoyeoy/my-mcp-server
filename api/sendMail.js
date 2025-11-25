// pages/api/sendMail.js (Next.js 13 이하)
//  업데이트 재배포
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,   // 예: newsrun.sender@gmail.com
    pass: process.env.GMAIL_PASS,   // 앱 비밀번호
  },
});

export default async function handler(req, res) {
  // CORS (원하면 그대로 씀)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const { to, subject, html } = req.body || {};

  if (!to || !subject || !html) {
    return res.status(400).json({ error: "to, subject, html are required" });
  }

  try {
    await transporter.sendMail({
      from: `"Newsrun" <${process.env.GMAIL_USER}>`, // 발신자: 네 Gmail
      to,
      subject,
      html,
    });

    return res.status(200).json({ status: "sent", to });
  } catch (err) {
    console.error("Mail send error:", err);
    return res.status(500).json({ error: "failed to send mail", details: err.message });
  }
}
