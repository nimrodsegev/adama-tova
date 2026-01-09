"use client";
import { useState, useEffect } from "react";
import ProtectedRoute from "@/lib/components/ProtectedRoute";
import { useUser } from "@/app/contexts/UserContext";
import { useIvrita } from "@/app/contexts/IvritaContext";
import { useRouter } from "next/navigation";
import { apiUser } from "@/app/services/db_api";
import styles from "./ProfilePage.module.css";

// Available options for Interests
const AVAILABLE_INTERESTS = [
  "מדיטציה",
  "יוגה",
  "אומנות",
  "כתיבה",
  "מיינדפולנס",
  "יצירה",
];

export default function ProfilePage() {
  const { user, userProfile, loading, signOut } = useUser();
  const { t } = useIvrita();
  const router = useRouter();

  // --- STATE ---
  const [branches, setBranches] = useState<string[]>([]);

  // Phone Editing State
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [phone, setPhone] = useState("");

  // Interests Editing State
  const [isEditingInterests, setIsEditingInterests] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);

  // --- EFFECT: Load Data ---
  useEffect(() => {
    if (userProfile) {
      // 1. Branches
      if (userProfile.branches && userProfile.branches.length > 0) {
        setBranches(userProfile.branches);
      } else {
        setBranches(["nahalal", "satria"]);
      }

      // 2. Phone
      setPhone(userProfile.phone || "");

      // 3. Interests
      if (userProfile.quiz?.interests) {
        setSelectedInterests(userProfile.quiz.interests);
      }
    }
  }, [userProfile]);

  const handleLogout = async () => {
    await signOut();
    router.replace("/login");
    router.refresh();
  };

  // --- HANDLERS: Branches ---
  const toggleBranch = async (branch: string) => {
    if (!user) return;
    let newBranches = [];
    if (branches.includes(branch)) {
      if (branches.length === 1) return alert(t("חובה לבחור לפחות סניף אחד"));
      newBranches = branches.filter((b) => b !== branch);
    } else {
      newBranches = [...branches, branch];
    }
    setBranches(newBranches);
    await apiUser.updateUserBranches(user.id, newBranches);
  };

  // --- HANDLERS: Phone ---
  const handleSavePhone = async () => {
    if (!user) return;
    setSaving(true);

    // Clean phone (remove dashes/spaces)
    const cleanPhone = phone.replace(/[-\s]/g, "");

    // Basic validation (Israeli mobile)
    const isValid = /^05\d{8}$/.test(cleanPhone);
    if (!isValid) {
      alert("מספר טלפון לא תקין. נא להזין 10 ספרות (לדוגמה: 0501234567)");
      setSaving(false);
      return;
    }

    const [_, error] = await apiUser.updateUserPhone(user.id, cleanPhone);

    if (error) {
      alert("שגיאה בעדכון: " + error);
    } else {
      alert("הטלפון עודכן בהצלחה! ✅");
      setIsEditingDetails(false);
      window.location.reload(); // Refresh to update context
    }
    setSaving(false);
  };

  // --- HANDLERS: Interests ---
  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests((prev) => prev.filter((i) => i !== interest));
    } else {
      setSelectedInterests((prev) => [...prev, interest]);
    }
  };

  const handleSaveInterests = async () => {
    if (!user) return;
    setSaving(true);
    const [_, error] = await apiUser.updateUserInterests(
      user.id,
      selectedInterests
    );

    if (error) {
      alert("שגיאה בעדכון: " + error);
    } else {
      alert("תחומי העניין עודכנו בהצלחה! ✅");
      setIsEditingInterests(false);
      window.location.reload();
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="mobile-container">
          <p className="text-loading">טוען...</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="mobile-container">
        <div className={styles.content}>
          {/* HEADER */}
          <div className={styles.header}>
            <h1 className={styles.pageTitle}>הפרופיל שלי</h1>
            <button onClick={handleLogout} className={styles.logoutButton}>
              {t("התנתק/י")}
            </button>
          </div>

          {/* 1. PERSONAL DETAILS (Editable Phone) */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>פרטים אישיים</h2>
              {!isEditingDetails && (
                <button
                  onClick={() => setIsEditingDetails(true)}
                  className={styles.editButton}
                >
                  ✏️
                </button>
              )}
            </div>

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>שם:</span>
              <span className={styles.detailValue}>
                {userProfile?.full_name || "לא צוין"}
              </span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>אימייל:</span>
              <span className={styles.detailValue}>
                {userProfile?.email || user?.email}
              </span>
            </div>

            {/* Phone Field - Toggle between Text and Input */}
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>טלפון:</span>
              {isEditingDetails ? (
                <div className={styles.editPhoneContainer}>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={styles.phoneInput}
                  />
                  <button
                    onClick={handleSavePhone}
                    disabled={saving}
                    className={styles.saveButton}
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingDetails(false);
                      setPhone(userProfile?.phone || "");
                    }}
                    className={styles.cancelButton}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <span className={styles.detailValue}>
                  {userProfile?.phone || "לא צוין"}
                </span>
              )}
            </div>
          </div>

          {/* 2. BRANCH PREFERENCES */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>סניף</h2>

            <div className={styles.branchContainer}>
              {["nahalal", "satria"].map((branch) => {
                const isSelected = branches.includes(branch);
                const label = branch === "nahalal" ? "נהלל" : "סטריה";
                return (
                  <button
                    key={branch}
                    onClick={() => toggleBranch(branch)}
                    className={`${styles.branchButton} ${
                      isSelected ? styles.branchButtonSelected : ""
                    }`}
                  >
                    {isSelected && "✓ "} {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. INTERESTS (Editable) */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>תחומי עניין</h2>
              {!isEditingInterests && (
                <button
                  onClick={() => setIsEditingInterests(true)}
                  className={styles.editButton}
                >
                  ✏️
                </button>
              )}
            </div>

            {isEditingInterests ? (
              // --- EDIT MODE ---
              <div>
                <div className={styles.interestsGrid}>
                  {AVAILABLE_INTERESTS.map((tag) => {
                    const isSelected = selectedInterests.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleInterest(tag)}
                        className={`${styles.interestButton} ${
                          isSelected ? styles.interestButtonSelected : ""
                        }`}
                      >
                        {tag} {isSelected && "✓"}
                      </button>
                    );
                  })}
                </div>
                <div className={styles.actionButtons}>
                  <button
                    onClick={handleSaveInterests}
                    disabled={saving}
                    className={styles.saveButton}
                  >
                    {saving ? "..." : "שמור"}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingInterests(false);
                      if (userProfile?.quiz?.interests)
                        setSelectedInterests(userProfile.quiz.interests);
                    }}
                    className={styles.cancelButton}
                  >
                    ביטול
                  </button>
                </div>
              </div>
            ) : (
              // --- VIEW MODE ---
              <div>
                {selectedInterests.length > 0 ? (
                  <div className={styles.interestTags}>
                    {selectedInterests.map((interest, i) => (
                      <span key={i} className={styles.interestTag}>
                        {interest}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-empty">לא נבחרו.</p>
                )}
              </div>
            )}
          </div>

          {/* Admin Badge */}
          {userProfile?.role === "admin" && (
            <div className={styles.adminBadge}>🔑 מנהל</div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
