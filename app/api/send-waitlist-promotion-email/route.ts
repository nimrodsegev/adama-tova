import { getEmailTransport } from "@/lib/email";
import { EMAIL_ADDRESS } from "@/lib/config";
import { getFreePlaceEmailHtml, getFreePlacePendingApprovalEmailHtml } from "@/lib/emailTemplates";
import { type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, name, activityTitle, needsApproval } = await request.json();

    if (!email) {
      return Response.json({ success: false, message: "Missing email" }, { status: 400 });
    }

    const transport = getEmailTransport();

    const message = {
      from: `"המרחב" <${EMAIL_ADDRESS}>`,
      to: email,
      subject: needsApproval
        ? "התפנה מקום בקבוצה - ממתין לאישור - המרחב"
        : "התפנה מקום בפעילות - המרחב",
      html: needsApproval
        ? getFreePlacePendingApprovalEmailHtml(name, activityTitle)
        : getFreePlaceEmailHtml(name, activityTitle),
    };

    await transport.sendMail(message);

    return Response.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending waitlist promotion email:", error);
    return Response.json({ success: false, message: "Failed to send email" }, { status: 500 });
  }
}
