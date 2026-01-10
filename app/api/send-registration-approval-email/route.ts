import { getEmailTransport } from "@/lib/email";
import { EMAIL_ADDRESS } from "@/lib/config";
import { type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, name, activityTitle } = await request.json();

    if (!email) {
      return Response.json({ success: false, message: "Missing email" }, { status: 400 });
    }

    const transport = getEmailTransport();

    const message = {
      from: `"אדמה טובה" <${EMAIL_ADDRESS}>`,
      to: email,
      subject: "בקשתך אושרה - אדמה טובה",
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>שלום ${name || ""},</h2>
          <p>יש לנו בשורות טובות!</p>
          <p>בקשתך להצטרף ל<strong>"${activityTitle}"</strong> אושרה.</p>
          <p>נתראה בפעילות!</p>
          <br/>
          <p>בברכה,<br/>צוות אדמה טובה</p>
        </div>
      `,
    };

    await transport.sendMail(message);

    return Response.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending registration approval email:", error);
    return Response.json({ success: false, message: "Failed to send email" }, { status: 500 });
  }
}
