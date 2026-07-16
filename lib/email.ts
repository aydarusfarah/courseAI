/**
 * lib/email.ts — Transactional email via Resend.
 * All functions no-op gracefully when RESEND_API_KEY is not set.
 */

import { logger } from "./logger";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

async function sendEmail(payload: EmailPayload): Promise<{ id?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    logger.warn("Resend not configured — email skipped", { to: payload.to, subject: payload.subject });
    return {};
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const from = process.env.RESEND_FROM_EMAIL ?? "noreply@courseai.app";

    const { data, error } = await resend.emails.send({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text
    });

    if (error) {
      logger.error("Resend send failed", { error: error.message, to: payload.to });
      return { error: error.message };
    }

    logger.info("Email sent", { id: data?.id, to: payload.to });
    return { id: data?.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error("Email send error", { error: msg });
    return { error: msg };
  }
}

// ── Transactional templates ───────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, name: string) {
  return sendEmail({
    to,
    subject: "Welcome to CourseAI 🎓",
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h1 style="font-size:24px;font-weight:700;color:#1f2328">Welcome, ${name}!</h1>
        <p style="color:#57606a">You've successfully joined CourseAI — the AI-powered platform for building premium online courses.</p>
        <p style="color:#57606a">Get started by creating your first course in the <a href="${process.env.NEXT_PUBLIC_APP_URL}/generator" style="color:#4f46e5">AI Course Generator</a>.</p>
        <p style="color:#57606a;font-size:13px;margin-top:32px">The CourseAI Team</p>
      </div>`,
    text: `Welcome, ${name}! Visit ${process.env.NEXT_PUBLIC_APP_URL}/generator to create your first course.`
  });
}

export async function sendPlanUpgradeEmail(to: string, name: string, plan: string) {
  return sendEmail({
    to,
    subject: `You're now on CourseAI ${plan} ✨`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h1 style="font-size:24px;font-weight:700;color:#1f2328">You upgraded to ${plan}!</h1>
        <p style="color:#57606a">Hi ${name}, your CourseAI subscription is now active. Enjoy unlimited courses, all export formats, and premium templates.</p>
        <p style="color:#57606a">Visit your <a href="${process.env.NEXT_PUBLIC_APP_URL}/billing" style="color:#4f46e5">billing dashboard</a> to manage your subscription.</p>
        <p style="color:#57606a;font-size:13px;margin-top:32px">The CourseAI Team</p>
      </div>`,
    text: `Hi ${name}, your CourseAI ${plan} subscription is active. Visit ${process.env.NEXT_PUBLIC_APP_URL}/billing.`
  });
}

export async function sendCourseGeneratedEmail(to: string, name: string, courseTitle: string, courseId: string) {
  return sendEmail({
    to,
    subject: `Your course "${courseTitle}" is ready 🎉`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h1 style="font-size:24px;font-weight:700;color:#1f2328">Course ready!</h1>
        <p style="color:#57606a">Hi ${name}, your course <strong>${courseTitle}</strong> has been generated and is ready to review.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/courses/${courseId}" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:9999px;text-decoration:none;font-weight:600;margin-top:16px">View your course</a>
        <p style="color:#57606a;font-size:13px;margin-top:32px">The CourseAI Team</p>
      </div>`,
    text: `Hi ${name}, your course "${courseTitle}" is ready. View it at: ${process.env.NEXT_PUBLIC_APP_URL}/courses/${courseId}`
  });
}
