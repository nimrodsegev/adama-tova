"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./AboutPage.module.css";
import SmoothPageWrapper from "@/lib/components/UI/SmoothPageWrapper";
import Button from "@/lib/components/UI/Button";

export default function AboutPage() {
  // Mounting state to ensure smooth entry animation
  const [mounting, setMounting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setMounting(false), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SmoothPageWrapper isLoading={mounting}>
      <div className={styles.aboutContainer}>
      {/* Close Button - Top Right */}
      <Link href="/login" className={styles.closeButton} aria-label="סגור">
        <Image
          src="/icons/close.svg"
          alt="Close icon"
          width={40}
          height={40}
        />
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

          {/* Video Section */}
          <div className={styles.videoContainer}>
            <iframe
              src="https://www.youtube.com/embed/A_cPHriFA-Y"
              title="אדמה טובה"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className={styles.video}
            />
          </div>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className={styles.bottomButtons}>
        <a
          href="https://www.google.com/maps/place/Hahita+St+2,+Sitriya/@31.8959682,34.8382764,988m/data=!3m2!1e3!4b1!4m6!3m5!1s0x1502b635b4564bab:0xd4d8e784d7da8a09!8m2!3d31.8959637!4d34.8431473!16s%2Fg%2F11c2fw57jz"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none' }}
        >
          <Button
            variant="secondary"
            size="L-short"
            icon="/icons/google_maps.svg"
          >
            ניווט למרחב
          </Button>
        </a>
        <a
          href="https://www.adamatova.org/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none' }}
        >
          <Button
            variant="primary"
            size="L-short"
          >
            לאתר
          </Button>
        </a>
      </div>
      </div>
    </SmoothPageWrapper>
  );
}
