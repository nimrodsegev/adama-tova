"use client";
import { useState, useEffect, useLayoutEffect, useRef } from "react";
import ProtectedRoute from "@/lib/components/ProtectedRoute";
import { useUser } from "@/app/contexts/UserContext";
import { useIvrita } from "@/app/contexts/IvritaContext";
import { useRouter } from "next/navigation";
import { apiUser } from "@/app/services/db_api";
import styles from "./ProfilePage.module.css";
import Button from "@/lib/components/UI/Button";
import SmoothPageWrapper from "@/lib/components/UI/SmoothPageWrapper";
import Popup from "@/lib/components/UI/Popup";

const AVAILABLE_INTERESTS = [
  "מיינדפולנס",
  "גוף ותנועה",
  "מוזיקה",
  "יצירה וחומר",
];

export default function ProfilePage() {
  const { user, userProfile, loading, signOut } = useUser();
  const { t } = useIvrita();
  const router = useRouter();

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // --- STATE ---
  const [branches, setBranches] = useState<string[]>([]);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [phone, setPhone] = useState("");
  const [isEditingExtras, setIsEditingExtras] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [mounting, setMounting] = useState(true);
  
  // Popups State
  const [showBranchError, setShowBranchError] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false); 

  useEffect(() => {
    if (userProfile) {
      if (userProfile.branches && userProfile.branches.length > 0) {
        setBranches(userProfile.branches);
      } else {
        setBranches(["nahalal", "satria"]);
      }
      setPhone(userProfile.phone || "");
      if (userProfile.quiz?.interests) {
        setSelectedInterests(userProfile.quiz.interests);
      }
    }

    const timer = setTimeout(() => {
      setMounting(false);
    }, 50);

    return () => clearTimeout(timer);
  }, [userProfile]);

  // --- FLOATING LABEL FIX ---
  useLayoutEffect(() => {
    const updateLabelBackgrounds = () => {
      const vh = window.innerHeight;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
      const labels = document.querySelectorAll(
        `.${styles.floatingLabel}`
      ) as NodeListOf<HTMLElement>;
      labels.forEach((el) => {
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--bg-y", `${-rect.top}px`);
      });
    };
    updateLabelBackgrounds();
    const raf = requestAnimationFrame(updateLabelBackgrounds);
    window.addEventListener("resize", updateLabelBackgrounds);
    const container = scrollContainerRef.current;
    if (container)
      container.addEventListener("scroll", updateLabelBackgrounds, {
        passive: true,
      });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", updateLabelBackgrounds);
      if (container)
        container.removeEventListener("scroll", updateLabelBackgrounds);
    };
  }, [isEditingPersonal, isEditingExtras]);

  // --- LOGOUT HANDLERS ---
  const handleLogoutClick = () => {
    setShowLogoutPopup(true);
  };

  const confirmLogout = async () => {
    setShowLogoutPopup(false);
    await signOut();
    router.replace("/login");
    router.refresh();
  };

  const handleSavePersonal = async () => {
    if (!user) return;
    setSaving(true);
    const cleanPhone = phone.replace(/[-\s]/g, "");
    if (!/^05\d{8}$/.test(cleanPhone)) {
      alert("מספר טלפון לא תקין");
      setSaving(false);
      return;
    }
    const [_, error] = await apiUser.updateUserPhone(user.id, cleanPhone);
    if (error) alert("שגיאה בעדכון");
    else {
      setIsEditingPersonal(false);
      window.location.reload();
    }
    setSaving(false);
  };

  const toggleBranch = (branch: string) => {
    if (branches.includes(branch)) {
      if (branches.length === 1) {
        setShowBranchError(true);
        return;
      }
      setBranches(branches.filter((b) => b !== branch));
    } else {
      setBranches([...branches, branch]);
    }
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest))
      setSelectedInterests((prev) => prev.filter((i) => i !== interest));
    else setSelectedInterests((prev) => [...prev, interest]);
  };

  const handleSaveExtras = async () => {
    if (!user) return;
    setSaving(true);
    await apiUser.updateUserInterests(user.id, selectedInterests);
    await apiUser.updateUserBranches(user.id, branches);
    setIsEditingExtras(false);
    setSaving(false);
  };

  const handleToUserList = () => {
    router.push("/AdminScreens/UserManagement");
  };
  const handleToAddAdmin = () => {
    router.push("/AdminScreens/CreateNewAdmin");
  };

  const isAdmin = userProfile?.role === "admin";

  return (
    <ProtectedRoute>
      <SmoothPageWrapper isLoading={loading || mounting}>
        <main className={styles.pageContainer}>
          <div className={styles.header}>
            <h1 className={styles.userName}>
              {userProfile?.full_name || "אורח"}
            </h1>
            {isAdmin && <span className={styles.adminLabel}>מנהלת</span>}
          </div>

          <div className={styles.scrollContainer} ref={scrollContainerRef}>
            {/* --- SECTION 1: PERSONAL DETAILS --- */}
            <div className={styles.profileBox}>
              <div className={styles.boxHeader}>
                <span className={styles.bodyL}>פרטים אישיים</span>
              </div>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.bodyS}>טלפון</span>
                  <span className={styles.bodyS} dir="ltr">
                    {userProfile?.phone || "לא צוין"}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.bodyS}>אימייל</span>
                  <span className={styles.bodyS} dir="ltr">
                    {userProfile?.email || user?.email}
                  </span>
                </div>
              </div>
            </div>

            {/* --- SECTION 2: ADDITIONAL DETAILS --- */}
            {!isAdmin &&
              (isEditingExtras ? (
                <div className={styles.editModeContainer}>
                  <h2 className={styles.bodyL}>פרטים נוספים</h2>

                  <div className={styles.detailItem}>
                    <span className={styles.bodyS} style={{ color: "#fff" }}>
                      הסניף הקרוב אליי
                    </span>
                    {/* BRANCHES BUTTONS */}
                    <div className={styles.optionsGroup}>
                      {["nahalal", "satria"].map((b) => (
                        <button
                          key={b}
                          onClick={() => toggleBranch(b)}
                          className={`${styles.optionToggle} ${
                            branches.includes(b) ? styles.selected : ""
                          }`}
                        >
                          {b === "nahalal" ? "נהלל" : "סתריה"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.detailItem}>
                    <span className={styles.bodyS} style={{ color: "#fff" }}>
                      תחומי עניין
                    </span>
                    {/* INTERESTS BUTTONS */}
                    <div className={styles.optionsGroup}>
                      {AVAILABLE_INTERESTS.map((int) => (
                        <button
                          key={int}
                          onClick={() => toggleInterest(int)}
                          className={`${styles.optionToggle} ${
                            selectedInterests.includes(int)
                              ? styles.selected
                              : ""
                          }`}
                        >
                          {int}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.boxFooter}>
                    <Button
                      className={styles.saveButtonCustom}
                      onClick={handleSaveExtras}
                      disabled={saving}
                    >
                      {saving ? "שומר..." : "סיימתי"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className={styles.profileBox}>
                  <div className={styles.boxHeader}>
                    <span className={styles.bodyL}>פרטים נוספים</span>
                  </div>
                  <div className={styles.detailsGrid}>
                    <div className={styles.detailItem}>
                      <span className={styles.bodyS}>הסניף הקרוב אליי</span>
                      <span className={styles.bodyS} dir="ltr">
                        {branches
                          .map((b) => (b === "nahalal" ? "נהלל" : "סתריה"))
                          .join(", ")}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.bodyS}>המעגל שלי</span>
                      <span className={styles.bodyS} dir="ltr">
                        {userProfile?.quiz?.circle || "לא צוין"}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.bodyS}>תחומי עניין</span>
                      <span className={styles.bodyS} dir="ltr">
                        {selectedInterests.length > 0
                          ? selectedInterests.join(", ")
                          : "לא נבחרו"}
                      </span>
                    </div>
                  </div>
                  <div className={styles.boxFooter}>
                    <Button
                      className={styles.editButtonCustom}
                      onClick={() => setIsEditingExtras(true)}
                    >
                      עריכה
                    </Button>
                  </div>
                </div>
              ))}

            {/* --- LOGOUT BUTTON --- */}
            <div className={styles.buttonsRow}>
              <div className={styles.logOutButton}>
                <Button
                  variant="tertiary"
                  tertiarySize="medium"
                  tertiaryWeight="semibold"
                  colorType="delete"
                  onClick={handleLogoutClick}
                >
                  התנתק
                </Button>
              </div>
            </div>
            {isAdmin && (
              <Button
                className={styles.AddAdminButton}
                onClick={handleToAddAdmin}
              >
                הוספת מנהל
              </Button>
            )}
            {isAdmin && (
              <button
                style={{
                  marginTop: "40px",
                  padding: "6px 12px",
                  fontSize: "10px",
                  background: "#444",
                  color: "#888",
                  border: "none",
                  borderRadius: "4px",
                  opacity: 0.6,
                }}
                onClick={() => router.push("/debug-viewport")}
              >
                debug
              </button>
            )}
          </div>

          {/* POPUPS WRAPPED IN CENTERED CONTAINER */}
          {(showBranchError || showLogoutPopup) && (
            <div className={styles.popupWrapper}>
              
              {showBranchError && (
                <Popup
                  title="חובה לבחור לפחות סניף אחד"
                  content="יש לבחור לפחות סניף אחד"
                  secondaryButtonText="סגור"
                  secondaryButtonAction={() => setShowBranchError(false)}
                  onClose={() => setShowBranchError(false)}
                />
              )}

              {showLogoutPopup && (
                <Popup
                  content="האם אתה בטוח שאתה רוצה להתנתק?"
                  primaryButtonText="כן אני בטוח"
                  primaryButtonAction={confirmLogout}
                  secondaryButtonText="ביטול"
                  secondaryButtonAction={() => setShowLogoutPopup(false)}
                  onClose={() => setShowLogoutPopup(false)}
                />
              )}
            </div>
          )}

        </main>
      </SmoothPageWrapper>
    </ProtectedRoute>
  );
}