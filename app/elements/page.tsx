"use client";
import React, { useState } from "react";
import HomeFilter, { FilterOption } from "@/lib/components/UI/HomeFilter";
import Button from "@/lib/components/UI/Button";

// Define option sets locally or import them
const OPTIONS_SHORT: FilterOption[] = [
  { id: "all", label: "הכל" },
  { id: "unread", label: "לא נקרא" },
];
const OPTIONS_MEDIUM: FilterOption[] = [
  { id: "pending", label: "ממתינים לאישור" },
  { id: "approved", label: "המפגשים הבאים" },
];
const OPTIONS_LONG: FilterOption[] = [
  { id: "rec", label: "מומלץ עבורך" },
  { id: "yours", label: "השיעורים שלי" },
  { id: "history", label: "היסטוריה" },
];

const ClockIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export default function ElementsPage() {
  const [filter1, setFilter1] = useState("all");
  const [filter2, setFilter2] = useState("pending");
  const [filter3, setFilter3] = useState("rec");

  return (
    <div
      className="mobile-container"
      style={{
        padding: "20px",
        overflow: "auto", // Override global overflow: hidden
        position: "relative", // Override global position: fixed
        height: "100vh", // Full viewport height
      }}
    >
      {/* Background decoration */}
      <div className="vector-background" />

      <div className="main-content-high">
        {/* FILTERS SECTION */}
        <section className="section">
          <h2 className="text-section-title mb-md">פילטרים (Flexible Width)</h2>

          {/* Example 1: Short Text */}
          <div className="mb-md">
            <p className="text-small mb-xs opacity-75">טקסט קצר (2 כפתורים)</p>
            <HomeFilter
              options={OPTIONS_SHORT}
              activeOption={filter1}
              onFilterChange={setFilter1}
            />
          </div>

          {/* Example 2: Medium Text */}
          <div className="mb-md">
            <p className="text-small mb-xs opacity-75">
              טקסט בינוני (2 כפתורים)
            </p>
            <HomeFilter
              options={OPTIONS_MEDIUM}
              activeOption={filter2}
              onFilterChange={setFilter2}
            />
          </div>

          {/* Example 3: Long Text / 3 Buttons */}
          <div className="mb-md">
            <p className="text-small mb-xs opacity-75">טקסט ארוך (3 כפתורים)</p>
            <HomeFilter
              options={OPTIONS_LONG}
              activeOption={filter3}
              onFilterChange={setFilter3}
            />
          </div>
        </section>

        {/* BUTTONS SECTION */}
        <section className="section mt-2xl">
          <h2 className="text-section-title mb-md">כפתורים (Buttons)</h2>
          <Button
            variant="login"
            customBgColor="var(--color-orange-main)"
            customTextColor="var(--color-text-primary)"
            customBorderColor="var(--color-text-primary)"
          >
            יצירת משתמש
          </Button>
          <Button
            variant="login"
            customBgColor="var(--color-text-primary)"
            customTextColor="var(--color-orange-main)"
            customBorderColor="var(--color-orange-main)"
            icon={
              <img
                src="/icons/google.png"
                alt="Google"
                width={24}
                height={24}
                style={{ objectFit: "contain" }}
              />
            }
          >
            התחבר עם גוגל
          </Button>

          {/* L Primary Buttons */}
          <div className="mb-xl">
            <p className="text-small mb-xs opacity-75">
              L Primary (44px height)
            </p>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <Button variant="primary" size="L">
                לאתר
              </Button>
              <Button variant="primary" size="L">
                הסרה מהמתנה
              </Button>
              <Button variant="primary" size="L">
                סיים עריכה
              </Button>
            </div>
          </div>

          {/* L-short Primary Buttons */}
          <div className="mb-xl">
            <p className="text-small mb-xs opacity-75">
              L-short Primary (36px height)
            </p>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <Button variant="primary" size="L-short">
                סיום
              </Button>
              <Button
                variant="custom"
                customBgColor="var(--color-orange-main)"
                customTextColor="var(--color-white-pure)"
                customBorderColor="var(--color-white-pure)"
                size="L-short"
              >
                סגור
              </Button>
              <Button
                variant="secondary"
                size="L-short"
                customTextColor="var(--color-orange-main)"
              >
                כן, שלח מייל
              </Button>
            </div>
          </div>

          {/* L Secondary Buttons */}
          <div className="mb-xl">
            <p className="text-small mb-xs opacity-75">
              L Secondary (44px height)
            </p>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <Button variant="secondary" size="L">
                ניווט למרחב
              </Button>
              <Button
                variant="secondary"
                customTextColor="var(--color-purple-text)"
                size="L"
                icon={<ClockIcon />}
              >
                הצטרפות לקבוצה
              </Button>
            </div>
          </div>

          {/* Tertiary Buttons */}
          <div className="mb-xl">
            <p className="text-small mb-xs opacity-75">
              Tertiary (Text + Arrow)
            </p>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <Button variant="tertiary" colorType="white">
                הוספת תלמיד חדש
              </Button>
              <Button variant="tertiary" colorType="orange">
                עריכת פרטים
              </Button>
              <Button variant="tertiary" colorType="delete">
                מחיקת חשבון
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
