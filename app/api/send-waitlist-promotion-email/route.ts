import { getEmailTransport } from "@/lib/email";
import { EMAIL_ADDRESS } from "@/lib/config";
import { type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, name, activityTitle, needsApproval } = await request.json();

    if (!email) {
      return Response.json({ success: false, message: "Missing email" }, { status: 400 });
    }

    const transport = getEmailTransport();

    // Different message for groups (needs admin approval) vs regular activities
    const htmlContent = needsApproval
      ? `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>שלום ${name || ""},</h2>
          <p>יש לנו בשורות טובות!</p>
          <p>התפנה מקום בקבוצה <strong>"${activityTitle}"</strong>.</p>
          <p>בקשתך הועברה לאישור המנהל ותקבל/י הודעה ברגע שהסטטוס יתעדכן.</p>
          <br/>
          <p>בברכה,<br/>צוות אדמה טובה</p>
        </div>
      `
      : `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>שלום ${name || ""},</h2>
          <p>יש לנו בשורות טובות!</p>
          <p>התפנה מקום בפעילות <strong>"${activityTitle}"</strong> ורשמנו אותך אליה אוטומטית.</p>
          <br/>
          <p>אם אינך מעוניין/ת להשתתף, אנא היכנס/י לאתר ובטל/י את ההרשמה כדי לפנות את המקום למישהו אחר.</p>
          <br/>
          <p>בברכה,<br/>צוות אדמה טובה</p>
        </div>
      `;

    const message = {
      from: `"אדמה טובה" <${EMAIL_ADDRESS}>`,
      to: email,
      subject: needsApproval
        ? "התפנה מקום בקבוצה - ממתין לאישור - אדמה טובה"
        : "התפנה מקום בפעילות - אדמה טובה",
      html: htmlContent,
    };

    await transport.sendMail(message);

    return Response.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending waitlist promotion email:", error);
    return Response.json({ success: false, message: "Failed to send email" }, { status: 500 });
  }
}
