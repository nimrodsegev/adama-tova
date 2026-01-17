import { getEmailTransport } from "@/lib/email";
import { EMAIL_ADDRESS } from "@/lib/config";
import { getRegistrationApprovalEmailHtml } from "@/lib/emailTemplates";
import { type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, name, activityTitle } = await request.json();

    if (!email) {
      return Response.json({ success: false, message: "Missing email" }, { status: 400 });
    }

    const transport = getEmailTransport();

    const message = {
      from: `"המרחב" <${EMAIL_ADDRESS}>`,
      to: email,
      subject: "בקשתך אושרה - המרחב",
      html: getRegistrationApprovalEmailHtml(name, activityTitle),
    };

    await transport.sendMail(message);

    return Response.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending registration approval email:", error);
    return Response.json({ success: false, message: "Failed to send email" }, { status: 500 });
  }
}
