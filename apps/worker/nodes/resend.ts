import { Resend } from "resend";

interface SendEmailParams {
  apiKey: string;
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({
  apiKey,
  to,
  subject,
  html,
}: SendEmailParams) => {
  try {
    const resend = new Resend(apiKey);

    const response = await resend.emails.send({
      from: "onboarding@resend.dev",
      to,
      subject,
      html,
    });
    console.log("Email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
};