"use client";
import Link from "next/link";
import styles from "./AboutPage.module.css";

export default function AboutPage() {
  return (
    // Uses global mobile-container (Orange background, RTL, correct width)
    <div className="mobile-container">
      
      {/* CHANGED: Switched from <header> to <div> to avoid the global dark background.
         Added top margins to match the original vertical positioning.
      */}
      <div className="p-xl mt-2xl pt-xl mb-lg">
        <h1 className="header-primary" style={{ color: "var(--color-text-primary)" }}>
          אדמה טובה
        </h1>
      </div>

      {/* Content Area */}
      <div className="vertical-scroll p-xl" style={{ maxHeight: "calc(100vh - 300px)" }}>
        
        {/* Story Section */}
        <section className="section gap-sm mb-xl">
          <h2 className="text-section-title" style={{ color: "var(--color-text-primary)" }}>
            הסיפור שלנו
          </h2>
          <p className="text-body" style={{ color: "var(--color-text-secondary)" }}>
            מרחב &ldquo;אדמה טובה&rdquo; הוא יוזמה פרטית וולנטרית, שתחילה הוקם
            במושב סתריה בכדי לתמוך נפשית בנפגעות ונפגעי המסיבות בדרום
            ובקרוביהם (בני משפחה, חברים מהקהילה), לאחר הטראומה רבת השעות,
            ההתמודדות עם רגעי האימה וחוסר הודאות, ואובדן בני משפחה וחברים
            והשבר בקהילה. בהדרגה הורחב המענה עבור המשפחות השכולות וכלל נפגעי
            פעולות האיבה והמלחמה מה-7/10/23, ומעגלי התמיכה שלהם, ואף נפתח מרחב
            נוסף בצפון, בנהלל.
          </p>
          <p className="text-body" style={{ color: "var(--color-text-secondary)" }}>
            האפליקציה מאפשרת מרחב נגישות עבור משתתפים בקהילה, ומציעה דרך נוחה
            לראות את פעילויות העמותה, להירשם אליהם ולהיות במעקב אחרי אירועים
            שקורים בעמותה.
          </p>
        </section>

        {/* Activities Section */}
        <section className="section gap-sm mb-2xl">
          <h2 className="text-section-title" style={{ color: "var(--color-text-primary)" }}>
            פעילות המרחב
          </h2>
          <p className="text-body" style={{ color: "var(--color-text-secondary)" }}>
            מרחב &ldquo;אדמה טובה&rdquo; הנמצא בסתריה, פועל בימים א׳ ג׳ ד׳
            בשעות 16:00 עד 22:00.
          </p>
          <p className="text-body" style={{ color: "var(--color-text-secondary)" }}>
            מוזמנים ומוזמנות פשוט להגיע!
          </p>
        </section>
      </div>

      {/* Bottom Actions */}
      <div className={styles.bottomActions}>
        {/* White Action Button */}
        <a
          href="https://www.adamatova.org/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.actionButton}
        >
          לפרטים נוספים
        </a>

        {/* Back Button */}
        <Link href="/login" className={styles.backButton}>
          חזרה
        </Link>
      </div>
    </div>
  );
}