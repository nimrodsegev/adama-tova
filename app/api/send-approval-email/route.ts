import { getEmailTransport } from "@/lib/email";
import { EMAIL_ADDRESS } from "@/lib/config";
import { type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return Response.json({ success: false, message: "Missing email" }, { status: 400 });
    }

    const transport = getEmailTransport();

    const message = {
      from: `"אדמה טובה" <${EMAIL_ADDRESS}>`,
      to: email,
      subject: "הבקשה שלך אושרה - אדמה טובה",
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>שלום ${name || ""},</h2>
          <p>אנחנו שמחים לבשר לך שהבקשה שלך להצטרף לאדמה טובה <strong>אושרה!</strong></p>
          <p>כעת תוכל/י להיכנס לאתר ולהירשם לפעילויות.</p>
          <p><a href="https://adama-tova.vercel.app/login">לחצ/י כאן להתחברות</a></p>
          <br/>
          <p>בברכה,<br/>צוות אדמה טובה</p>
        </div>
      `,
    };

    await transport.sendMail(message);

    return Response.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending approval email:", error);
    return Response.json({ success: false, message: "Failed to send email" }, { status: 500 });
  }
}
