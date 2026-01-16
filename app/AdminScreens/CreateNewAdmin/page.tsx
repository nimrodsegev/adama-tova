"use client";

import { useState, useRef, useLayoutEffect } from "react";
import Image from "next/image"; // Added for icon
import { apiUser } from "@/app/services/db_api";
import { useIvrita } from "@/app/contexts/IvritaContext";
import { useRouter } from "next/navigation";
import styles from "./CreateNewAdmin.module.css";
import SmoothPageWrapper from "@/lib/components/UI/SmoothPageWrapper"; // Added wrapper
import CutInput from "@/lib/components/UI/CutInput";
import UnifiedDropdown from "@/lib/components/UI/UnifiedDropdown";

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
  const [gender, setGender] = useState("");

  // UI State
  const [genderDropdownOpen, setGenderDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Animation State
  const [closing, setClosing] = useState(false);

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

  // --- Close Animation Handler ---
  const handleCloseWithAnimation = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      router.back();
    }, 400);
  };

  const handleSubmit = async () => {
    if (!fullName || !email || !password || !phone || !gender) {
      alert("נא למלא את כל השדות");
      return;
    }

    setIsSubmitting(true);

    try {
      const [res, error] = await apiUser.createAdmin(
        email, 
        password, 
        fullName, 
        phone,
        gender
      );
    
      alert("מנהל נוסף בהצלחה!");
      handleCloseWithAnimation(); // Reuse close logic to exit
    } catch (error: any) {
      console.error("Error creating admin:", error);
      alert("שגיאה ביצירת המנהל: " + (error.message || "אירעה תקלה"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SmoothPageWrapper isLoading={closing}>
    <main className={`mobile-container ${styles.pageOverride}`}>
      
      {/* NEW CLOSE BUTTON */}
      <button
        className={styles.closeButton}
        onClick={handleCloseWithAnimation}
        aria-label="סגור"
      >
        <Image
          src="/icons/close.svg"
          alt="Close icon"
          width={40}
          height={40}
        />
      </button>

      <div className={styles.header}>
        <h1 className={styles.headerTitle}>הוספת מנהל חדש</h1>
      </div>

      <div className={styles.scrollContainer} ref={scrollContainerRef}>
        {/* Full Name */}
        <CutInput 
            label="שם מלא" 
            value={fullName} 
            onChange={(e) => setFullName(e.target.value)} 
            className={styles.cutInput} 
            type="text"
            dir="rtl"
            textAlign="right"
        />
      
        {/* Gender Selector - Wrapped to fix Z-Index */}
        <div 
          className={`${styles.dropdownContainer} ${genderDropdownOpen ? styles.activeDropdownWrapper : ''}`}
        >
          <UnifiedDropdown
              label="מין" 
              placeholder="בחר/י"
              options={GENDER_OPTIONS}
              value={gender}
              onChange={setGender}
              isOpen={genderDropdownOpen}
              onToggle={() => setGenderDropdownOpen(!genderDropdownOpen)}
          />
        </div>

        {/* Email */}
        <CutInput 
            label="אימייל" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className={styles.cutInput} 
            type="email"
            dir="ltr"
            textAlign="right"
        />

        {/* Phone */}
        <CutInput 
            label="טלפון" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            className={styles.cutInput} 
            type="tel"
            dir="ltr"
            textAlign="right"
        />

        {/* Password */}
        <CutInput 
            label="סיסמא" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className={styles.cutInput} 
            type="text"
            dir="ltr"
            textAlign="right"
        />

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
    </SmoothPageWrapper>
  );
}