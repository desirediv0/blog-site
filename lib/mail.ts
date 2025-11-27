import nodemailer from "nodemailer";
import { config } from "./config";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename?: string;
    path?: string;
    content?: string | Buffer;
    contentType?: string;
    cid?: string;
  }>;
}

const sendEmail = async (options: EmailOptions) => {
  try {
    let transporter;

    const hasSmtpCreds = Boolean(
      process.env.SMTP_USER &&
        (process.env.SMTP_SERVICE || process.env.SMTP_HOST)
    );

    if (!hasSmtpCreds && process.env.NODE_ENV !== "production") {
      // Dev fallback: use Ethereal test account if SMTP is not configured
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.warn(
        "Using Ethereal test SMTP account for emails. Preview URLs will be logged."
      );
    } else {
      const port = Number(process.env.SMTP_PORT || config.smtp.port || 587);
      const secure = process.env.SMTP_SECURE
        ? String(process.env.SMTP_SECURE).toLowerCase() === "true"
        : port === 465; // 465 is implicit TLS

      const transportConfig = process.env.SMTP_SERVICE
        ? {
            service: process.env.SMTP_SERVICE,
            auth: {
              user: process.env.SMTP_USER || config.smtp.user,
              pass:
                process.env.SMTP_PASSWORD ||
                process.env.SMTP_PASS ||
                config.smtp.pass,
            },
          }
        : {
            host: process.env.SMTP_HOST || config.smtp.host,
            port,
            secure,
            auth: {
              user: process.env.SMTP_USER || config.smtp.user,
              pass:
                process.env.SMTP_PASSWORD ||
                process.env.SMTP_PASS ||
                config.smtp.pass,
            },
          };

      transporter = nodemailer.createTransport(transportConfig);

      // In development, skip verification (just log warning if it fails)
      // Verification can fail even if credentials are correct (e.g., network issues)
      if (process.env.NODE_ENV !== "production") {
        try {
          await transporter.verify();
          console.log("SMTP connection verified successfully");
        } catch (verifyError: unknown) {
          const errorMessage =
            verifyError instanceof Error
              ? verifyError.message
              : String(verifyError);
          console.warn(
            "SMTP verification failed (continuing anyway):",
            errorMessage
          );
          console.warn(
            "Email will still be attempted. If sending fails, check your SMTP credentials."
          );
          // Don't throw - let the actual send attempt determine if it works
        }
      }
    }

    const fromAddress = `${
      process.env.EMAIL_FROM_NAME ||
      config.app.adminEmail.split("@")[0] ||
      "Blog Site"
    } <${
      process.env.FROM_EMAIL ||
      process.env.SMTP_USER ||
      config.smtp.user ||
      "no-reply@example.com"
    }>`;

    const mailOptions = {
      from: fromAddress,
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments || [],
    };

    const info = await transporter.sendMail(mailOptions);

    // Log preview URL for Ethereal in dev
    if (process.env.NODE_ENV !== "production" && nodemailer.getTestMessageUrl) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log("Email preview URL:", previewUrl);
      }
    }

    return info;
  } catch (error) {
    console.error("Email sending error:", error);
    throw error;
  }
};

export { sendEmail };
