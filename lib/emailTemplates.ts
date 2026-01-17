import { BASE_URL } from "./config";

const LOGO_URL = `${BASE_URL}/mails/emails_hamerhav/images/logo_with_text.png`;

// Base wrapper for all emails
const emailWrapper = (content: string) => `
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0 !important; padding: 0 !important; background-color: #f6f6f6; font-family: Arial, sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; direction: rtl; text-align: right;">
    <table role="presentation" style="background-color: #f6f6f6; width: 100%; padding: 40px 10px; border-spacing: 0; border-collapse: collapse !important;">
        <tr>
            <td align="center">
                <table role="presentation" style="background-color: #ffffff; margin: 0 auto; max-width: 600px; width: 600px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); overflow: hidden; border-spacing: 0; border-collapse: collapse !important;">
                    <tr>
                        <td style="padding: 40px 0 20px 0; background-color: #ffffff; text-align: center;">
                            <img src="${LOGO_URL}" alt="המרחב" width="120" style="margin: 0 auto; border: 0; line-height: 100%; outline: none; text-decoration: none;">
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px 50px; text-align: right; color: #555555; font-size: 16px; line-height: 1.6;">
                            ${content}
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f4f4f4; padding: 20px; text-align: center; border-top: 1px solid #eeeeee; font-size: 12px; color: #999999;">
                            © 2026 המרחב
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

const buttonStyle = `
  background-color: #E74E1C;
  border-radius: 6px;
  color: #ffffff;
  display: inline-block;
  font-size: 16px;
  font-weight: bold;
  line-height: 50px;
  text-align: center;
  text-decoration: none;
  width: 200px;
  -webkit-text-size-adjust: none;
  border: 1px solid transparent;
`.replace(/\n/g, " ").trim();

const h1Style = "margin: 0 0 10px 0; font-size: 24px; color: #333333; font-weight: bold;";
const pStyle = "margin: 0 0 2px 0;";
const btnContainerStyle = "text-align: right; margin: 20px 0;";

// Email 1: User approval (joined the app)
export function getApprovalEmailHtml(name?: string): string {
  const content = `
    <h1 style="${h1Style}">שלום${name ? ` ${name}` : ""},</h1>
    <p style="${pStyle}">אנחנו שמחים לבשר לך שהבקשה שלך להצטרף למרחב אושרה!</p>
    <p style="${pStyle}">כעת תוכל.י להיכנס לאפליקציה ולהירשם לפעילות.</p>

    <div style="${btnContainerStyle}">
        <a href="${BASE_URL}/login" style="${buttonStyle}">לחצ.י כאן להתחברות</a>
    </div>

    <p style="${pStyle}">
        מחכים לראות אותך במרחב,<br>
        צוות אדמה טובה
    </p>
  `;
  return emailWrapper(content);
}

// Email 2: Activity/Group registration approved
export function getRegistrationApprovalEmailHtml(name?: string, activityTitle?: string): string {
  const content = `
    <h1 style="${h1Style}">שלום${name ? ` ${name}` : ""},</h1>
    <p style="${pStyle}">יש לנו בשורות טובות!</p>
    <p style="${pStyle}">בקשתך להצטרף ל${activityTitle ? `״${activityTitle}״` : "פעילות"} אושרה.</p>

    <div style="${btnContainerStyle}">
        <a href="${BASE_URL}/login" style="${buttonStyle}">מעבר לאפליקציה</a>
    </div>

    <p style="${pStyle}">
        מחכים לראות אותך במרחב,<br>
        צוות אדמה טובה
    </p>
  `;
  return emailWrapper(content);
}

// Email 3: Waitlist promotion - spot opened up (auto registered)
export function getFreePlaceEmailHtml(name?: string, activityTitle?: string): string {
  const content = `
    <h1 style="${h1Style}">שלום${name ? ` ${name}` : ""},</h1>
    <p style="${pStyle}">התפנה לנו מקום בשבילך בסדנא${activityTitle ? ` - ${activityTitle}` : ""}.</p>
    <p style="${pStyle}">הסטטוס שלך עודכן ואת.ה רשומ.ה לסדנא.</p>
    <p style="${pStyle}">אם ברצונך לבטל את ההרשמה, תוכל.י לעשות זאת דרך האפליקציה.</p>

    <div style="${btnContainerStyle}">
        <a href="${BASE_URL}/login" style="${buttonStyle}">מעבר לאפליקציה</a>
    </div>

    <p style="${pStyle}">
        מחכים לראות אותך במרחב,<br>
        צוות אדמה טובה
    </p>
  `;
  return emailWrapper(content);
}

// Email 4: Waitlist promotion - spot opened but needs approval (for groups)
export function getFreePlacePendingApprovalEmailHtml(name?: string, activityTitle?: string): string {
  const content = `
    <h1 style="${h1Style}">שלום${name ? ` ${name}` : ""},</h1>
    <p style="${pStyle}">יש לנו בשורות טובות!</p>
    <p style="${pStyle}">התפנה מקום בקבוצה${activityTitle ? ` ״${activityTitle}״` : ""}.</p>
    <p style="${pStyle}">בקשתך הועברה לאישור המנהל ותקבל.י הודעה ברגע שהסטטוס יתעדכן.</p>

    <div style="${btnContainerStyle}">
        <a href="${BASE_URL}/login" style="${buttonStyle}">מעבר לאפליקציה</a>
    </div>

    <p style="${pStyle}">
        מחכים לראות אותך במרחב,<br>
        צוות אדמה טובה
    </p>
  `;
  return emailWrapper(content);
}
