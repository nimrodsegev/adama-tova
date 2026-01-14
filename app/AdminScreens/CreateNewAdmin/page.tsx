"use client";

import { useState, useRef, useLayoutEffect } from "react";
import { apiUser } from "@/app/services/db_api";
import { useIvrita } from "@/app/contexts/IvritaContext";
import { useRouter } from "next/navigation";
import styles from "./CreateNewAdmin.module.css";
// --- Constants ---
const GENDER_OPTIONS = [
  { value: "male", label: "זכר" },
  { value: "female", label: "נקבה" },
  { value: "prefer_not_to_say", label: "מעדיף לא לציין" },
];

export default function CreateNewAdmin() {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState(""); // Gender State

  // UI State
  const [genderDropdownOpen, setGenderDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- FLOATING LABEL BACKGROUND FIX ---
  useLayoutEffect(() => {
    const updateLabelBackgrounds = () => {
      const vh = window.innerHeight;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
      const labels = document.querySelectorAll(`.${styles.inputLabel}`) as NodeListOf<HTMLElement>;
      labels.forEach((el) => {
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--bg-y", `${-rect.top}px`);
      });
    };
    updateLabelBackgrounds();
    window.addEventListener("resize", updateLabelBackgrounds);
    if (scrollContainerRef.current) {
        scrollContainerRef.current.addEventListener("scroll", updateLabelBackgrounds);
    }
    return () => {
        window.removeEventListener("resize", updateLabelBackgrounds);
        if (scrollContainerRef.current) {
            scrollContainerRef.current.removeEventListener("scroll", updateLabelBackgrounds);
        }
    };
  }, [genderDropdownOpen]);

  const handleSubmit = async () => {
    if (!fullName || !email || !password || !phone || !gender) {
      alert("נא למלא את כל השדות");
      return;
    }

    setIsSubmitting(true);

    try {
      // Assuming apiUser.createAdmin now accepts gender as a 5th param
      // or you will update it to handle the object/param.
      const [res, error] = await apiUser.createAdmin(
        email, 
        password, 
        fullName, 
        phone,
        gender
      );
      alert("מנהל נוסף בהצלחה!");
      router.push("/AdminScreens/HomePage");
    } catch (error: any) {
      console.error("Error creating admin:", error);
      alert("שגיאה ביצירת המנהל: " + (error.message || "אירעה תקלה"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={`mobile-container ${styles.pageOverride}`}>
      <button className="close-button" onClick={() => router.back()}>
        <div className="close-button-inner" />
        <div className="close-icon" />
      </button>

      <div className={styles.header}>
        <h1 className={styles.headerTitle}>הוספת מנהל חדש</h1>
      </div>

      <div className={styles.scrollContainer} ref={scrollContainerRef}>
        
        {/* Full Name */}
        <div className={styles.inputWrapper}>
            <input 
                type="text" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                className={styles.inputField} 
                placeholder=" "
            />
            <label className={styles.inputLabel}>שם מלא</label>
        </div>

        {/* Gender Selector (Added Block) */}
        <div className={styles.genderSelector}>
            <div className={styles.inputWrapper}>
            <span className={styles.inputLabel}>מין</span>
            <button
                type="button"
                onClick={() => setGenderDropdownOpen(!genderDropdownOpen)}
                className={`${styles.genderToggle} ${
                genderDropdownOpen ? styles.open : ""
                }`}
            >
                <span className={!gender ? styles.accordionPlaceholder : ""}>
                {gender
                    ? GENDER_OPTIONS.find((g) => g.value === gender)?.label
                    : "בחר/י"}
                </span>
                <span
                className={`${styles.genderToggleArrow} ${
                    genderDropdownOpen ? styles.open : ""
                }`}
                >
                ▼
                </span>
            </button>
            </div>
            {genderDropdownOpen && (
            <div className={styles.genderDropdown}>
                {GENDER_OPTIONS.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                        setGender(option.value);
                    }}
                    className={`${styles.genderOption} ${
                    gender === option.value ? styles.selected : ""
                    }`}
                >
                    {option.label}
                </button>
                ))}
            </div>
            )}
        </div>

        {/* Email */}
        <div className={styles.inputWrapper}>
            <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className={styles.inputField} 
                placeholder=" "
                style={{ direction: 'ltr', textAlign: 'right' }}
            />
            <label className={styles.inputLabel}>אימייל</label>
        </div>

        {/* Phone */}
        <div className={styles.inputWrapper}>
            <input 
                type="tel" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                className={styles.inputField} 
                placeholder=" "
                style={{ direction: 'ltr', textAlign: 'right' }}
            />
            <label className={styles.inputLabel}>טלפון</label>
        </div>

        {/* Password */}
        <div className={styles.inputWrapper}>
            <input 
                type="text" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className={styles.inputField} 
                placeholder=" "
                style={{ direction: 'ltr', textAlign: 'right' }}
            />
            <label className={styles.inputLabel}>סיסמא</label>
        </div>

        {/* Submit Button */}
        <div className={styles.buttonContainer}>
            <button 
                onClick={handleSubmit} 
                disabled={isSubmitting} 
                className={styles.submitButton}
            >
                {isSubmitting ? "יוצר..." : "צור מנהל"}
            </button>
        </div>

      </div>
    </main>
  );
}