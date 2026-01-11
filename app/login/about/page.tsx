"use client";

import Link from "next/link";
import styles from "./AboutPage.module.css";

export default function AboutPage() {
  return (
    <div className={styles.aboutContainer}>
      {/* Close Button - Top Right */}
      <Link href="/login" className="close-button">
        <span className="close-button-inner"></span>
        <span className="close-icon"></span>
      </Link>

      {/* Content Frame */}
      <div className={styles.contentFrame}>
        {/* Title */}
        <h1 className={styles.title}>אדמה טובה</h1>

        {/* Content Sections */}
        <div className={styles.content}>
          {/* Our Story Section */}
          <section className={styles.section}>
            <h2 className={styles.sectionHeader}>הסיפור שלנו</h2>
            <p className={styles.sectionText}>
              מרחב &ldquo;אדמה טובה&rdquo; הוא יוזמה פרטית וולנטרית, שתחילה הוקם
              במושב סתריה בכדי לתמוך נפשית בנפגעות ונפגעי המסיבות בדרום
              ובקרוביהם (בני משפחה, חברים מהקהילה), לאחר הטראומה רבת השעות,
              ההתמודדות עם רגעי האימה וחוסר הודאות, ואובדן בני משפחה וחברים
              והשבר בקהילה. בהדרגה הורחב המענה עבור המשפחות השכולות וכלל נפגעי
              פעולות האיבה והמלחמה מה-7/10/23, ומעגלי התמיכה שלהם, ואף נפתח מרחב
              נוסף בצפון, בנהלל.
            </p>
            <p className={styles.sectionText}>
              האפליקציה מאפשרת מרחב נגישות עבור משתתפים בקהילה, ומציעה דרך נוחה
              לראות את פעילויות העמותה, להירשם אליהם ולהיות במעקב אחרי אירועים
              שקורים בעמותה.
            </p>
          </section>

          {/* Treatment Plan Section */}
          <section className={styles.section}>
            <h2 className={styles.sectionHeader}>פעילות המרחב</h2>
            <p className={styles.sectionText}>
              מרחב &ldquo;אדמה טובה&rdquo; הנמצא בסתריה, פועל בימים א׳ ג׳ ד׳
              בשעות 16:00 עד 22:00.
            </p>
            <p className={styles.sectionText}>מוזמנים ומוזמנות פשוט להגיע!</p>
          </section>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className={styles.bottomButtons}>
        <a
          href="https://maps.google.com/?q=סתריה"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.navigationButton}
        >
          ניווט למרחב
        </a>
        <a
          href="https://www.adamatova.org/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.websiteButton}
        >
          לאתר
        </a>
      </div>
    </div>
  );
}
