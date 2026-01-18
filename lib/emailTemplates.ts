import { BASE_URL } from "./config";

// Keep using PNG logo (SVG had issues)
const LOGO_URL = `${BASE_URL}/mails/emails_hamerhav/images/logo_with_text.png`;

// Responsive styles to be included in <style> tag
const responsiveStyles = `
    /* Base responsive resets */
    * { box-sizing: border-box; }

    /* Tablet and smaller desktops */
    @media screen and (max-width: 620px) {
        .email-wrapper {
            padding: 20px 10px !important;
        }
        .email-container {
            width: 100% !important;
            max-width: 100% !important;
        }
        .content {
            padding: 20px 30px !important;
        }
        .header {
            padding: 30px 0 15px 0 !important;
        }
        .btn-login {
            width: 180px !important;
        }
    }

    /* Mobile devices */
    @media screen and (max-width: 480px) {
        .email-wrapper {
            padding: 10px 5px !important;
        }
        .email-container {
            width: 100% !important;
            max-width: 100% !important;
            border-radius: 0 !important;
        }
        .header {
            padding: 25px 0 15px 0 !important;
        }
        .header img {
            width: 100px !important;
        }
        .content {
            padding: 15px 20px !important;
            font-size: 15px !important;
        }
        .content h1 {
            font-size: 20px !important;
        }
        .btn-container {
            text-align: center !important;
            margin: 15px 0 !important;
        }
        .btn-login {
            width: 100% !important;
            max-width: 250px !important;
            font-size: 15px !important;
            line-height: 45px !important;
        }
        .footer-cell {
            padding: 15px 10px !important;
            font-size: 11px !important;
        }
    }

    /* Very small mobile devices */
    @media screen and (max-width: 360px) {
        .content {
            padding: 12px 15px !important;
            font-size: 14px !important;
        }
        .content h1 {
            font-size: 18px !important;
        }
        .header img {
            width: 90px !important;
        }
        .btn-login {
            line-height: 42px !important;
            font-size: 14px !important;
        }
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
        .email-wrapper {
            background-color: #1a1a1a !important;
        }
        .email-container {
            background-color: #2d2d2d !important;
        }
        .content {
            color: #e0e0e0 !important;
        }
        .content h1 {
            color: #ffffff !important;
        }
        .footer-cell {
            background-color: #242424 !important;
            border-top-color: #3d3d3d !important;
            color: #888888 !important;
        }
    }
`;

// Base wrapper for all emails - now with responsive styles
const emailWrapper = (content: string) => `
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style type="text/css">
        ${responsiveStyles}
    </style>
</head>
<body style="margin: 0 !important; padding: 0 !important; background-color: #f6f6f6; font-family: Arial, sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; direction: rtl; text-align: right;">
    <table role="presentation" class="email-wrapper" style="background-color: #f6f6f6; width: 100%; padding: 40px 10px; border-spacing: 0; border-collapse: collapse !important; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
        <tr>
            <td align="center">
                <table role="presentation" class="email-container" style="background-color: #ffffff; margin: 0 auto; max-width: 600px; width: 600px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); overflow: hidden; border-spacing: 0; border-collapse: collapse !important;">
                    <tr>
                        <td class="header" style="padding: 40px 0 20px 0; background-color: #ffffff; text-align: center;">
                            <img src="${LOGO_URL}" alt="המרחב" width="120" style="margin: 0 auto; border: 0; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;">
                        </td>
                    </tr>
                    <tr>
                        <td class="content" style="padding: 20px 50px; text-align: right; color: #555555; font-size: 16px; line-height: 1.6;">
                            ${content}
                        </td>
                    </tr>
                    <tr>
                        <td class="footer-cell" style="background-color: #f4f4f4; padding: 20px; text-align: center; border-top: 1px solid #eeeeee; font-size: 12px; color: #999999;">
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

    <div class="btn-container" style="${btnContainerStyle}">
        <a href="${BASE_URL}/login" class="btn-login" style="${buttonStyle}">לחצ.י כאן להתחברות</a>
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

    <div class="btn-container" style="${btnContainerStyle}">
        <a href="${BASE_URL}/login" class="btn-login" style="${buttonStyle}">מעבר לאפליקציה</a>
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

    <div class="btn-container" style="${btnContainerStyle}">
        <a href="${BASE_URL}/login" class="btn-login" style="${buttonStyle}">מעבר לאפליקציה</a>
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

    <div class="btn-container" style="${btnContainerStyle}">
        <a href="${BASE_URL}/login" class="btn-login" style="${buttonStyle}">מעבר לאפליקציה</a>
    </div>

    <p style="${pStyle}">
        מחכים לראות אותך במרחב,<br>
        צוות אדמה טובה
    </p>
  `;
  return emailWrapper(content);
}
