"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { apiActivities, apiNotifications } from "@/app/services/db_api";
import { useIvrita } from "@/app/contexts/IvritaContext";
import { useRouter } from "next/navigation";
import styles from "./addNotification.module.css";
import SmoothPageWrapper from "@/lib/components/UI/SmoothPageWrapper";
import CutInput from "@/lib/components/UI/CutInput";
import UnifiedDropdown from "@/lib/components/UI/UnifiedDropdown";
import Popup from "@/lib/components/UI/Popup";

// --- CHANGED: Updated Options ---
const TARGET_OPTIONS = [
  { label: "לפי פעילות", value: "activity" },
  { label: "לפי מעגל", value: "circle" },
  { label: "לכל משתמשי המרחב", value: "all" }, // Changed 'date' to 'all'
];

const CIRCLE_OPTIONS = [
  { label: "שורדי מסיבות", value: "Nova Survivor" },
  { label: "נפגעי ה-7 באוקטובר", value: "October 7 victim" },
  { label: "הורים שכולים", value: "Shkulim parents" },
  { label: "אחים שכולים", value: "Shkulim Siblings" },
  { label: "משפחות נפגעי ה-7 באוקטובר", value: "Family of october 7 victim" },
  { label: "כוחות הצלה", value: "Rescue forces" },
  { label: "תושבי עוטף עזה", value: "Residence of Otef Aza" },
  { label: "מעגל שני או שלישי", value: "Second or third" },
];

export default function AddNotificationPage() {
  const router = useRouter();
  const { t } = useIvrita();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [mounting, setMounting] = useState(true);
  const [closing, setClosing] = useState(false);

  // Form State
  const [targetType, setTargetType] = useState<
    "" | "activity" | "all" | "circle" // Changed type definition
  >("");
  const [selectedActivityId, setSelectedActivityId] = useState("");
  const [selectedCircle, setSelectedCircle] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  // UI State
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Popup State
  const [showPopup, setShowPopup] = useState(false);
  const [popupConfig, setPopupConfig] = useState({
    title: "",
    content: "",
    isSuccess: false,
  });

  // Data State
  const [allActivities, setAllActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounting(false);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleCloseWithAnimation = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      router.back();
    }, 400);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-dropdown]")) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (targetType === "activity" && allActivities.length === 0) {
      const fetchActivities = async () => {
        setLoadingActivities(true);
        const [data, error] = await apiActivities.getAll();
        
        if (!error && data) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const futureActivities = data.filter((act: any) => {
            if (!act.date) return false;
            const actDate = new Date(act.date);
            return actDate >= today; 
          });

          futureActivities.sort((a: any, b: any) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
          );

          setAllActivities(futureActivities);
        }
        setLoadingActivities(false);
      };
      fetchActivities();
    }
  }, [targetType, allActivities.length]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let res: any[] | null = null;
      let err = null;

      if (targetType === "activity") {
        if (!selectedActivityId) throw new Error("יש לבחור סדנא");
        [res, err] = await apiActivities.notifyParticipants(
          selectedActivityId,
          title,
          message
        );
      } else if (targetType === "circle") {
        if (!selectedCircle) throw new Error("יש לבחור מעגל");
        [res, err] = await apiActivities.notifyByCircle(
          selectedCircle,
          title,
          message
        );
      } else if (targetType === "all") {
        // --- NEW LOGIC: Send to All ---
        [res, err] = await apiNotifications.notifyAllUsers(
          title,
          message
        );
      }

      if (err) throw err;

      const recipientCount = res ? res.length : 0;

      if (recipientCount === 0) {
        let emptyMsg = "לא נמצאו נמענים לשליחת ההודעה.";
        if (targetType === "activity") {
            emptyMsg = "לא נמצאו נרשמים לפעילות זו.";
        }

        setPopupConfig({
          title: "לא נמצאו נמענים",
          content: emptyMsg,
          isSuccess: false,
        });
      } else {
        setPopupConfig({
          title: "הודעה נשלחה",
          content: `ההודעה נשלחה בהצלחה`,
          isSuccess: true, 
        });
      }
      
      setShowPopup(true);

    } catch (error: any) {
      console.error("Error sending notification:", error);
      
      const errMsg = typeof error === 'string' ? error : (error.message || "Unknown error");

      if (
        errMsg.includes("No activities found") || 
        errMsg.includes("No participants found") || 
        errMsg.includes("No users")
      ) {
        setPopupConfig({
          title: "לא נמצאו נמענים",
          content: "לא נמצאו נמענים מתאימים, ולכן ההודעה לא נשלחה.",
          isSuccess: false, 
        });
      } else {
        setPopupConfig({
          title: "שגיאה",
          content: errMsg,
          isSuccess: false,
        });
      }
      
      setShowPopup(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    if (popupConfig.isSuccess) {
      router.push("/AdminScreens/HomePage");
    }
  };

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const activityOptions = allActivities.map((act) => ({
    label: `${act.title} (${act.date})`,
    value: act.id,
  }));

  return (
    <SmoothPageWrapper isLoading={mounting || closing}>
      <main className={`mobile-container ${styles.pageOverride}`}>
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
          <h1 className={styles.headerTitle}>יצירת הודעה חדשה</h1>
        </div>

        <div className={styles.scrollContainer} ref={scrollContainerRef}>
          {/* --- TARGET AUDIENCE --- */}
          <div
            data-dropdown
            className={`${styles.dropdownContainer} ${
              openDropdown === "target" ? styles.activeDropdownWrapper : ""
            }`}
          >
            <UnifiedDropdown
              label="קהל יעד"
              placeholder="בחר/י אפשרות"
              options={TARGET_OPTIONS}
              value={targetType}
              onChange={(val) => setTargetType(val as any)}
              isOpen={openDropdown === "target"}
              onToggle={() => toggleDropdown("target")}
            />
          </div>

          {/* --- ACTIVITY SELECT --- */}
          {targetType === "activity" && (
            <div
              data-dropdown
              className={`${styles.dropdownContainer} ${
                openDropdown === "activity" ? styles.activeDropdownWrapper : ""
              }`}
            >
              <UnifiedDropdown
                label="סדנא"
                placeholder={loadingActivities ? "טוען..." : "בחר/י סדנא"}
                options={activityOptions}
                value={selectedActivityId}
                onChange={setSelectedActivityId}
                isOpen={openDropdown === "activity"}
                onToggle={() => toggleDropdown("activity")}
              />
            </div>
          )}

          {/* --- CIRCLE SELECT --- */}
          {targetType === "circle" && (
            <div
              data-dropdown
              className={`${styles.dropdownContainer} ${
                openDropdown === "circle" ? styles.activeDropdownWrapper : ""
              }`}
            >
              <UnifiedDropdown
                label="מעגל"
                placeholder="בחר/י מעגל"
                options={CIRCLE_OPTIONS}
                value={selectedCircle}
                onChange={setSelectedCircle}
                isOpen={openDropdown === "circle"}
                onToggle={() => toggleDropdown("circle")}
              />
            </div>
          )}

          {/* NO EXTRA FIELDS NEEDED FOR "ALL" - Just the Inputs below */}

          {/* --- INPUTS --- */}
          <CutInput
            label="כותרת ההודעה"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.cutInput}
            type="text"
            dir="rtl"
            textAlign="right"
          />
          <CutInput
            label="תוכן ההודעה"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={styles.tallInput} 
            type="text"
            dir="rtl"
            textAlign="right"
            tall={true} 
          />
          <div className={styles.buttonContainer}>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !targetType || !title || !message}
              className={styles.submitButton}
            >
              {isSubmitting ? "שולח..." : "שלח הודעה"}
            </button>
          </div>
        </div>

        {/* --- POPUP COMPONENT --- */}
        {showPopup && (
          <div className={styles.popupWrapper}>
            <Popup
              title={popupConfig.title}
              content={popupConfig.content}
              secondaryButtonText={
                popupConfig.isSuccess ? "חזרה לדף הבית" : "סגור"
              }
              secondaryButtonAction={handlePopupClose}
              onClose={handlePopupClose}
            />
          </div>
        )}
      </main>
    </SmoothPageWrapper>
  );
}