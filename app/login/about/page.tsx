"use client";
import Link from "next/link";
import Image from "next/image";
import styles from "./AboutPage.module.css";

export default function AboutPage() {
  return (
    <div className={styles.container}>
      {/* Main Title */}
      <h1 className={styles.mainTitle}>אדמה טובה</h1>

      {/* Content Area - No Scroll */}
      <div className={styles.contentArea}>
        <div className={styles.content}>
          {/* Our Story Section */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>הסיפור שלנו</h2>
            <p className={styles.bodyText}>
              מרחב &ldquo;אדמה טובה&rdquo; הוא יוזמה פרטית וולנטרית, שתחילה הוקם
              במושב סתריה בכדי לתמוך נפשית בנפגעות ונפגעי המסיבות בדרום
              ובקרוביהם (בני משפחה, חברים מהקהילה), לאחר הטראומה רבת השעות,
              ההתמודדות עם רגעי האימה וחוסר הודאות, ואובדן בני משפחה וחברים
              והשבר בקהילה. בהדרגה הורחב המענה עבור המשפחות השכולות וכלל נפגעי
              פעולות האיבה והמלחמה מה-7/10/23, ומעגלי התמיכה שלהם, ואף נפתח מרחב
              נוסף בצפון, בנהלל.
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
              מרחב &ldquo;אדמה טובה&rdquo; הנמצא בסתריה, פועל בימים א׳ ג׳ ד׳
              בשעות 16:00 עד 22:00.
            </p>
            <p className={styles.bodyText}>מוזמנים ומוזמנות פשוט להגיע!</p>
          </section>
        </div>
      </div>

      {/* Single Action Button */}
      <div className={styles.actionButtonContainer}>
        <a
          href="https://www.adamatova.org/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.actionButton}
        >
          לפרטים נוספים
        </a>
      </div>
    </div>
  );
}
