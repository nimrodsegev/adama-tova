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
import OrganicCircles from "@/lib/components/OrganicCircles/OrganicCircles";
import styles from "./ActivityDetailsModal.module.css";

type ActivityDetailsModalProps = {
  activityId: string;
  isOpen: boolean;
  onClose: () => void;
  onRegistrationChange?: () => void;
  onMotionChange?: (state: "start" | "end", skipFetch?: boolean) => void;
};

// Branch Name Mapping
const BRANCH_MAPPING: Record<string, string> = {
  satria: "סתריה",
  nahalal: "נהלל",
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

  // Registration State
  const [regStatus, setRegStatus] = useState<"none" | "confirmed" | "waitlist">(
    "none"
  );
  const [waitlistPosition, setWaitlistPosition] = useState<number | null>(null);
  const [registrationCount, setRegistrationCount] = useState({
    confirmed: 0,
    total: 10,
    waitlist: 0,
  });

  // Modal State
  const [mounted, setMounted] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [registrationBackendStatus, setRegistrationBackendStatus] = useState<
    string | null
  >(null);
  const [hideDetailsModal, setHideDetailsModal] = useState(false);
  const [closing, setClosing] = useState(false);

  const isAdmin = userProfile?.role === "admin";

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen && activityId) {
      setHideDetailsModal(false); // Reset visibility when opening
      setClosing(false); // Reset closing state when opening
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

  // Handle close with animation
  const handleCloseWithAnimation = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 400);
  };

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

  // --- 1. REGISTER FLOW ---
  const handleRegistrationToggle = async () => {
    if (!user || loading || isAdmin) return;

    if (regStatus !== "none") {
      setIsCancelModalOpen(true);
      return;
    }

    // A. Start Wrapper FIRST (Fade In)
    onMotionChange?.("start");
    setLoading(true);

    try {
      const [res] = await apiRegistrations.registerUserToActivity(
        user.id,
        activityId
      );

      if (res && typeof res === "object" && "success" in res) {
        const isWaitlist = res.if_confirmed === false;

        // Update Local State
        setRegStatus(isWaitlist ? "waitlist" : "confirmed");
        setWaitlistPosition(res.wait_list_place || null);
        setRegistrationBackendStatus(res.status || null);

        // B. Wait for wrapper to cover screen (500ms)
        setTimeout(() => {
          // Hide the details UI so it doesn't overlap
          setHideDetailsModal(true);

          // Show the Success Modal
          setIsSuccessModalOpen(true);

          // C. Fade Out Wrapper (Skip Fetching Data yet)
          // This reveals the Success Modal
          onMotionChange?.("end", true);
        }, 500);
      } else {
        // Error case
        onMotionChange?.("end");
      }
    } catch (error) {
      console.error("Registration error:", error);
      onMotionChange?.("end");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. CANCEL FLOW ---
  const handleCancelConfirm = async () => {
    if (!user || loading) return;

    // Close the small confirmation modal immediately
    setIsCancelModalOpen(false);

    // A. Start Wrapper FIRST
    onMotionChange?.("start");
    setLoading(true);

    try {
      const [_, error] = await apiRegistrations.cancelRegistration(
        user.id,
        activityId
      );

      if (!error) {
        // B. Wait for wrapper (600ms)
        setTimeout(() => {
          // C. Close the Main Modal (Details) BEHIND the wrapper
          onClose();
          setRegStatus("none");
          setWaitlistPosition(null);

          // D. Fade Out Wrapper + Fetch Data
          // This reveals the underlying page (updated)
          onMotionChange?.("end");

          // Extra safety trigger for parent update
          onRegistrationChange?.();
        }, 600);
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

  // --- 3. CLOSE SUCCESS MODAL FLOW ---
  const handleSuccessModalClose = () => {
    // A. Start Wrapper (Fade In)
    onMotionChange?.("start");

    // B. Wait for wrapper (600ms)
    setTimeout(() => {
      // Close Success Modal
      setIsSuccessModalOpen(false);

      // Close Details Modal
      onClose();

      // C. Fade Out Wrapper + Fetch Data
      onMotionChange?.("end"); // skipFetch defaults to false -> triggers fetch

      onRegistrationChange?.();
    }, 600);
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

  // Formatting...
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

  // --- MAP BRANCH HERE ---
  const rawBranch = activity?.branch;
  const branch = BRANCH_MAPPING[rawBranch] || rawBranch || "המרכז";

  const description = activity?.description || "";
  const remainingSpots = Math.max(
    0,
    registrationCount.total - registrationCount.confirmed
  );
  const hasImage = !!activity?.image_url;
  const contentFrameStyle = { marginTop: hasImage ? "5rem" : "20vh" };

  const modalContent = (
    <>
      {/* Hide details if we are showing Success Modal */}
      {!hideDetailsModal && (
        <>
          <div className={styles.overlay} onClick={handleCloseWithAnimation} />
          <div className={styles.modalContainer}>
            <button className={styles.closeButton} onClick={handleCloseWithAnimation}>
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
              {(loading || closing) ? (
                <div className={styles.loadingContainer}>
                  <OrganicCircles
                    mode="loading"
                    radius={0.15}
                    baseColor="#FFFFFF"
                  />
                </div>
              ) : (
                <>
                  {hasImage && (
                    <div className={styles.imageContainer}>
                      <img
                        src={activity.image_url}
                        alt={activity.title}
                        className={styles.activityImage}
                      />
                    </div>
                  )}

                  <h2 className={styles.titleText}>{activity?.title || ""}</h2>

                  <div className={styles.detailsContainer}>
                    <div className={styles.textBlock}>
                      <p className={styles.primaryInfoText}>
                        {dayName} {dayMonth}
                      </p>
                      <p className={styles.primaryInfoText}>
                        בשעה {formattedTime}
                      </p>
                    </div>

                    <div className={styles.textBlock}>
                      <p className={styles.secondaryInfoText}>
                        בסניף {branch} ב{location}
                      </p>
                      <p className={styles.secondaryInfoText}>
                        בהנחיית {instructor}
                      </p>
                    </div>

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

                    <div className={styles.descriptionBlock}>
                      <p className={styles.descriptionText}>{description}</p>
                    </div>
                  </div>

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
          // Only close via X button or explicit close logic
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
