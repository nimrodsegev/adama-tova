"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/contexts/UserContext";
import { useIvrita } from "@/app/contexts/IvritaContext";
import { apiActivities, apiRegistrations } from "@/app/services/db_api";
import Button from "@/lib/components/UI/Button";
import CancelConfirmationModal from "@/lib/components/CancelConfirmationModal/CancelConfirmationModal";
import RegistrationSuccessModal from "@/lib/components/RegistrationSuccessModal/RegistrationSuccessModal";
import GroupRegistrationSuccessModal from "@/lib/components/RegistrationSuccessModal/GroupRegistrationSuccessModal";
import styles from "./ActivityDetailsModal.module.css";

type ActivityDetailsModalProps = {
  activityId: string;
  isOpen: boolean;
  onClose: () => void;
  onRegistrationChange?: () => void;
  onMotionChange?: (state: "start" | "end") => void;
};

export default function ActivityDetailsModal({
  activityId,
  isOpen,
  onClose,
  onRegistrationChange,
  onMotionChange,
}: ActivityDetailsModalProps) {
  const router = useRouter();
  const { user, userProfile } = useUser();
  const { t } = useIvrita();
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [regStatus, setRegStatus] = useState<"none" | "confirmed" | "waitlist">(
    "none"
  );
  const [waitlistPosition, setWaitlistPosition] = useState<number | null>(null);
  const [registrationCount, setRegistrationCount] = useState({
    confirmed: 0,
    total: 10,
    waitlist: 0,
  });
  const [mounted, setMounted] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [registrationBackendStatus, setRegistrationBackendStatus] = useState<
    string | null
  >(null);
  const [hideDetailsModal, setHideDetailsModal] = useState(false);

  const isAdmin = userProfile?.role === "admin";

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen && activityId) {
      fetchActivityDetails();
      checkRegistrationStatus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, activityId]);

  const fetchActivityDetails = async () => {
    setLoading(true);
    try {
      const [activityData, error] = await apiActivities.getById(activityId);
      if (!error && activityData) {
        setActivity(activityData);

        setRegistrationCount({
          confirmed: activityData.current_participants || 0,
          total: activityData.max_participants || 10,
          waitlist: activityData.waitlist_count || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching activity:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkRegistrationStatus = async () => {
    if (!user || !activityId) return;
    try {
      const [statusData, error] = await apiRegistrations.getRegistrationStatus(
        user.id,
        activityId
      );
      if (!error && statusData) {
        const { status, wait_list_place } = statusData;
        if (status === "confirmed" || status === "waitlist") {
          setRegStatus(status);
          setWaitlistPosition(wait_list_place);
        } else {
          setRegStatus("none");
          setWaitlistPosition(null);
        }
      } else {
        setRegStatus("none");
        setWaitlistPosition(null);
      }
    } catch (error) {
      console.error("Error checking registration:", error);
    }
  };

  const handleRegistrationToggle = async () => {
    if (!user || loading || isAdmin) return;

    if (regStatus !== "none") {
      setIsCancelModalOpen(true);
      return;
    }

    // Hide details modal but keep it mounted
    setHideDetailsModal(true);

    // Start motion overlay
    onMotionChange?.("start");
    setLoading(true);

    try {
      const [res] = await apiRegistrations.registerUserToActivity(
        user.id,
        activityId
      );

      if (res && typeof res === "object" && "success" in res) {
        const isWaitlist = res.if_confirmed === false;
        setRegStatus(isWaitlist ? "waitlist" : "confirmed");
        setWaitlistPosition(res.wait_list_place || null);
        setRegistrationBackendStatus(res.status || null);

        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsSuccessModalOpen(true);
      } else {
        setHideDetailsModal(false);
        onMotionChange?.("end");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setHideDetailsModal(false);
      onMotionChange?.("end");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelConfirm = async () => {
    if (!user || loading) return;

    // Close cancel modal
    setIsCancelModalOpen(false);

    // Close details modal
    onClose();

    // Start motion overlay
    onMotionChange?.("start");
    setLoading(true);

    try {
      const [_, error] = await apiRegistrations.cancelRegistration(
        user.id,
        activityId
      );
      if (!error) {
        setRegStatus("none");
        setWaitlistPosition(null);

        await new Promise((resolve) => setTimeout(resolve, 1000));
        onMotionChange?.("end");

        // Refresh data after a delay
        setTimeout(() => {
          onRegistrationChange?.();
        }, 300);
      } else {
        onMotionChange?.("end");
      }
    } catch (error) {
      console.error("Unregistration error:", error);
      onMotionChange?.("end");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false);

    // Close the details modal now
    onClose();

    // Start motion overlay again
    onMotionChange?.("start");
    setTimeout(() => {
      onMotionChange?.("end");
      // Refresh data after motion ends
      setTimeout(() => {
        onRegistrationChange?.();
      }, 300);
    }, 750);
  };

  const handleEdit = () => {
    onClose();
    router.push(`/AdminScreens/EditActivityPage?id=${activityId}`);
  };

  const handleDelete = async () => {
    if (!confirm(t("האם את/ה בטוח/ה שברצונך למחוק פעילות זו?"))) return;
    setLoading(true);
    const [_, error] = await apiActivities.delete(activityId);
    if (error) {
      alert("שגיאה במחיקה: " + error);
      setLoading(false);
    } else {
      alert("הפעילות נמחקה בהצלחה");
      onClose();
      onRegistrationChange?.();
    }
  };

  if (!isOpen || !mounted) return null;

  // -- Formatting Data --
  const formattedTime = activity?.start_time?.slice(0, 5) || "";
  const dateObj = activity?.date ? new Date(activity.date) : null;
  const dayName = dateObj
    ? dateObj.toLocaleDateString("he-IL", { weekday: "long" })
    : "";
  const dayMonth = dateObj
    ? `${dateObj.getDate().toString().padStart(2, "0")}.${(
        dateObj.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}`
    : "";

  const isGroup = activity?.is_group || !!activity?.series_id;
  const instructor = activity?.instructor || "";
  const location = activity?.location || "";
  const branch = activity?.branch || "המרכז";
  const description = activity?.description || "";

  // Calculate remaining spots
  const remainingSpots = Math.max(
    0,
    registrationCount.total - registrationCount.confirmed
  );

  // -----------------------------------------------------------
  // CONTROL HEIGHT HERE
  // If no image, we add a larger top margin (e.g., 20vh)
  // -----------------------------------------------------------
  const hasImage = !!activity?.image_url;
  const contentFrameStyle = {
    marginTop: hasImage ? "5rem" : "20vh",
  };

  const modalContent = (
    <>
      {!hideDetailsModal && (
        <>
          <div className={styles.overlay} onClick={onClose} />

          <div className={styles.modalContainer}>
            <button className={styles.closeButton} onClick={onClose}>
              <svg width="19.43" height="19.43" viewBox="0 0 20 20" fill="none">
                <line
                  x1="2"
                  y1="2"
                  x2="18"
                  y2="18"
                  stroke="#F9F9F9"
                  strokeWidth="1"
                />
                <line
                  x1="18"
                  y1="2"
                  x2="2"
                  y2="18"
                  stroke="#F9F9F9"
                  strokeWidth="1"
                />
              </svg>
            </button>

            <div className={styles.contentFrame} style={contentFrameStyle}>
              {loading ? (
                <p className={styles.loadingText}>טוען...</p>
              ) : (
                <>
                  {/* 1. Image */}
                  {hasImage && (
                    <div className={styles.imageContainer}>
                      <img
                        src={activity.image_url}
                        alt={activity.title}
                        className={styles.activityImage}
                      />
                    </div>
                  )}

                  {/* 2. Title */}
                  <h2 className={styles.titleText}>{activity?.title || ""}</h2>

                  {/* Details Container - All Right Aligned */}
                  <div className={styles.detailsContainer}>
                    {/* 3. Day + Date + Time */}
                    <div className={styles.textBlock}>
                      <p className={styles.primaryInfoText}>
                        {dayName} {dayMonth}
                      </p>
                      <p className={styles.primaryInfoText}>
                        בשעה {formattedTime}
                      </p>
                    </div>

                    {/* 4. Branch + Location + Instructor */}
                    <div className={styles.textBlock}>
                      <p className={styles.secondaryInfoText}>
                        בסניף {branch} ב{location}
                      </p>
                      <p className={styles.secondaryInfoText}>
                        בהנחיית {instructor}
                      </p>
                    </div>

                    {/* 5. Participants + Remaining Spots Logic */}
                    <div className={styles.textBlock}>
                      <p className={styles.secondaryInfoText}>
                        משתתפים: {registrationCount.confirmed}/
                        {registrationCount.total}{" "}
                        {remainingSpots === 0
                          ? "(לא נותרו מקומות)"
                          : `(נותרו ${remainingSpots} מקומות)`}
                        {regStatus === "waitlist" &&
                          waitlistPosition &&
                          ` (מיקומך: ${waitlistPosition})`}
                      </p>
                    </div>

                    {/* 6. Description (Small text) */}
                    <div className={styles.descriptionBlock}>
                      <p className={styles.descriptionText}>{description}</p>
                    </div>
                  </div>

                  {/* 7. Bottom Buttons (Centered) */}
                  <div className={styles.buttonContainer}>
                    {isAdmin ? (
                      <>
                        <Button
                          size="L"
                          onClick={handleEdit}
                          disabled={loading}
                        >
                          {t("[ערוך|ערכי]")}
                        </Button>
                        <Button
                          size="L"
                          variant="secondary"
                          onClick={handleDelete}
                          disabled={loading}
                        >
                          {loading ? "מוחק..." : t("מחק/י")}
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="L"
                        onClick={handleRegistrationToggle}
                        disabled={loading}
                      >
                        {regStatus === "none" ? "הרשמה" : "ביטול רישום"}
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {isCancelModalOpen && (
        <CancelConfirmationModal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          onConfirm={handleCancelConfirm}
          activityTitle={activity?.title || ""}
          activityDate={`${dayName} ${dayMonth}`}
          activityTime={formattedTime}
        />
      )}

      {isSuccessModalOpen &&
        (registrationBackendStatus === "pending" && regStatus !== "waitlist" ? (
          <GroupRegistrationSuccessModal
            isOpen={isSuccessModalOpen}
            onClose={handleSuccessModalClose}
            activityTitle={activity?.title || ""}
            startDate={dayMonth}
            startTime={formattedTime}
          />
        ) : (
          <RegistrationSuccessModal
            isOpen={isSuccessModalOpen}
            onClose={handleSuccessModalClose}
            activityTitle={activity?.title || ""}
            activityDate={dayMonth}
            activityTime={formattedTime}
            isGroup={isGroup}
            isWaitlist={regStatus === "waitlist"}
            waitlistPosition={waitlistPosition}
          />
        ))}
    </>
  );

  return createPortal(modalContent, document.body);
}
