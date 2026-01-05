"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./AboutPage.module.css";

export default function AboutPage() {
  return (
    <div className={styles.container}>
      {/* Background Image */}
      <div className={styles.backgroundImage}>
        <Image
          src="/bg_removal.png"
          alt="Background"
          width={206}
          height={169}
          style={{ objectFit: "contain" }}
          priority
        />
      </div>

      {/* Main Title */}
      <h1 className={styles.mainTitle}>אדמה טובה</h1>

      {/* Content Scroll Area */}
      <div className={styles.contentScroll}>
        <div className={styles.content}>
          {/* Our Story Section */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>הסיפור שלנו</h2>
            <p className={styles.bodyText}>
              מרחב "אדמה טובה" הוא יוזמה פרטית וולנטרית, שתחילה הוקם במושב סתריה
              בכדי לתמוך נפשית בנפגעות ונפגעי המסיבות בדרום ובקרוביהם (בני
              משפחה, חברים מהקהילה), לאחר הטראומה רבת השעות, ההתמודדות עם רגעי
              האימה וחוסר הודאות, ואובדן בני משפחה וחברים והשבר בקהילה. בהדרגה
              הורחב המענה עבור המשפחות השכולות וכלל נפגעי פעולות האיבה והמלחמה
              מה-7/10/23, ומעגלי התמיכה שלהם, ואף נפתח מרחב נוסף בצפון, בנהלל.
            </p>
            <p className={styles.bodyText}>
              האפליקציה מאפשרת מרחב נגישות עבור משתתפים בקהילה, ומציעה דרך נוחה
              לראות את פעילויות העמותה, להירשם אליהם ולהיות במעקב אחרי אירועים
              שקורים בעמותה.
            </p>
          </section>

          {/* Treatment Plan Section */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>פעילות המרחב</h2>
            <p className={styles.bodyText}>
              מרחב "אדמה טובה" הנמצא בסתריה, פועל בימים א׳ ג׳ ד׳ בשעות 16:00 עד
              22:00.
            </p>
            <p className={styles.bodyText}>מוזמנים ומוזמנות פשוט להגיע!</p>
          </section>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={styles.actionButtons}>
        <Link href="/contact" className={styles.actionButton}>
          + צור קשר
        </Link>
        <Link href="/activities" className={styles.actionButton}>
          + הוספת פעילות
        </Link>
      </div>

      {/* Link to Login Page */}
      <Link href="/login" className={styles.loginLink}>
        כניסה למערכת
      </Link>

      {/* Navigation Bar (placeholder) */}
      <nav className={styles.navBar}>
        <div className={styles.navIconPlaceholder}></div>
        <div className={styles.navIconPlaceholder}></div>
        <div className={styles.navIconPlaceholder}></div>
        <div className={styles.navIconPlaceholder}></div>
      </nav>
    </div>
  );
}
