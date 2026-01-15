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

  // 1. Force a "mounting" state to ensure the Wrapper sees "Loading=true"
  // on the very first render. This forces the orange screen to appear
  // before fading out.
  const [mounting, setMounting] = useState(true);

  useEffect(() => {
    // Determine branches/phone/interests from profile
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

    // 2. Turn off mounting after a tiny delay to trigger the animation
    const timer = setTimeout(() => {
      setMounting(false);
    }, 50); // 50ms is enough to let React paint the "loading" state first

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

  const handleLogout = async () => {
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
      if (branches.length === 1) return alert("חובה לבחור סניף אחד לפחות");
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
    console.log("Navigating to user list");
  };
  const handleToAddAdmin = () => {
    router.push("/AdminScreens/CreateNewAdmin");
  }

  const isAdmin = userProfile?.role === "admin";

  return (
    <ProtectedRoute>
      {/* 3. Pass (loading || mounting). 
         Even if `loading` is false, `mounting` keeps it true for 50ms.
         This forces SmoothPageWrapper to initialize in "Locked" state.
         When mounting flips to false, the wrapper transitions out nicely.
      */}
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
                    <span className={styles.detailValue} dir="ltr">
                      {userProfile?.phone || "לא צוין"}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.bodyS}>אימייל</span>
                    <span className={styles.detailValue}>
                      {userProfile?.email || user?.email}
                    </span>
                  </div>
                </div>
              </div>

            {/* --- SECTION 2: ADDITIONAL DETAILS --- */}
            {!isAdmin &&
              (isEditingExtras ? (
                <div className={styles.editModeContainer}>
                  <h2 className={styles.sectionTitle}>פרטים נוספים</h2>

                  <div
                    className={styles.detailItem}
                    style={{ alignItems: "flex-start", width: "100%" }}
                  >
                    <span
                      className={styles.bodyS}
                      style={{ color: "#fff" }}
                    >
                      הסניף הקרוב אליי
                    </span>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        marginTop: "0.5rem",
                      }}
                    >
                      {["nahalal", "satria"].map((b) => (
                        <button
                          key={b}
                          onClick={() => toggleBranch(b)}
                          style={{
                            background: branches.includes(b)
                              ? "rgba(255,255,255,0.2)"
                              : "transparent",
                            border: "1px solid #fff",
                            color: "white",
                            borderRadius: "4px",
                            padding: "6px 12px",
                            cursor: "pointer",
                          }}
                        >
                          {b === "nahalal" ? "נהלל" : "סתריה"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div
                    className={styles.detailItem}
                    style={{ alignItems: "flex-start", width: "100%" }}
                  >
                    <span
                      className={styles.bodyS}
                      style={{ color: "#fff" }}
                    >
                      תחומי עניין
                    </span>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        flexWrap: "wrap",
                        justifyContent: "flex-start",
                        marginTop: "0.5rem",
                      }}
                    >
                      {AVAILABLE_INTERESTS.map((int) => (
                        <button
                          key={int}
                          onClick={() => toggleInterest(int)}
                          style={{
                            background: selectedInterests.includes(int)
                              ? "rgba(255,255,255,0.2)"
                              : "transparent",
                            border: "1px solid #fff",
                            color: "white",
                            borderRadius: "4px",
                            padding: "6px 12px",
                            cursor: "pointer",
                            fontSize: "0.8rem",
                          }}
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
                    <span className={styles.boxTitle}>פרטים נוספים</span>
                  </div>
                  <div className={styles.detailsGrid}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>
                        הסניף הקרוב אליי
                      </span>
                      <span className={styles.detailValue}>
                        {branches
                          .map((b) => (b === "nahalal" ? "נהלל" : "סתריה"))
                          .join(", ")}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>המעגל שלי</span>
                      <span className={styles.detailValue}>
                        {userProfile?.quiz?.circle || "לא צוין"}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>תחומי עניין</span>
                      <span className={styles.detailValue}>
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
              {isAdmin && (
            <div className={styles.buttonsRow}>
                <Button className={styles.usersList} onClick={handleToUserList}>
                  רשימת משתמשים
                  <span className={styles.pressArrow}></span>
                </Button>
            </div>)}
            <div className={styles.buttonsRow}>
                <Button className={styles.logOutButton} onClick={handleLogout}>
                  התנתק
                  <span className={styles.redPressArrow}></span>
                </Button>
            </div>
          </div>
          {isAdmin && (
                <Button className={styles.AddAdminButton} onClick={handleToAddAdmin}>
                  הוספת מנהל
                </Button>)}
        </main>
      </SmoothPageWrapper>
    </ProtectedRoute>
  );
}
