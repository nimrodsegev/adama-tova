"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/contexts/UserContext";
import { useIvrita } from "@/app/contexts/IvritaContext";
import { apiActivities, apiRegistrations } from "@/app/services/db_api";
import Button from "@/lib/components/UI/Button";
import Popup from "@/lib/components/UI/Popup";
import CancelConfirmationModal from "@/lib/components/CancelConfirmationModal/CancelConfirmationModal";
import RegistrationSuccessModal from "@/lib/components/RegistrationSuccessModal/RegistrationSuccessModal";
import GroupRegistrationSuccessModal from "@/lib/components/RegistrationSuccessModal/GroupRegistrationSuccessModal";
import ActivityRegistrationsModal from "@/lib/components/ActivityRegistrationsModal/ActivityRegistrationsModal";
import OrganicCircles from "@/lib/components/OrganicCircles/OrganicCircles";
import styles from "./ActivityDetailsModal.module.css";
import Image from "next/image";

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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRegistrationsModalOpen, setIsRegistrationsModalOpen] =
    useState(false);
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
      setHideDetailsModal(false);
      setClosing(false);
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

  const handleRegistrationToggle = async () => {
    if (!user || loading || isAdmin) return;

    if (regStatus !== "none") {
      setIsCancelModalOpen(true);
      return;
    }

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

        setTimeout(() => {
          setHideDetailsModal(true);
          setIsSuccessModalOpen(true);
          onMotionChange?.("end", true);
        }, 500);
      } else {
        onMotionChange?.("end");
      }
    } catch (error) {
      console.error("Registration error:", error);
      onMotionChange?.("end");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelConfirm = async () => {
    if (!user || loading) return;

    setIsCancelModalOpen(false);
    onMotionChange?.("start");
    setLoading(true);

    try {
      const [_, error] = await apiRegistrations.cancelRegistration(
        user.id,
        activityId
      );

      if (!error) {
        setTimeout(() => {
          onClose();
          setRegStatus("none");
          setWaitlistPosition(null);
          onMotionChange?.("end");
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

  const handleSuccessModalClose = () => {
    onMotionChange?.("start");

    setTimeout(() => {
      setIsSuccessModalOpen(false);
      onClose();
      onMotionChange?.("end");
      onRegistrationChange?.();
    }, 600);
  };

  const handleEdit = () => {
    onClose();
    router.push(`/AdminScreens/EditActivityPage?id=${activityId}`);
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setLoading(true);
    const [_, error] = await apiActivities.delete(activityId);
    if (error) {
      alert("שגיאה במחיקה: " + error);
      setLoading(false);
      setIsDeleteModalOpen(false);
    } else {
      alert("הפעילות נמחקה בהצלחה");
      setIsDeleteModalOpen(false);
      onClose();
      onRegistrationChange?.();
    }
  };

  if (!isOpen || !mounted) return null;

  // Formatting
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
  const rawBranch = activity?.branch;
  const branch = BRANCH_MAPPING[rawBranch] || rawBranch || "המרכז";
  const description = activity?.description || "";
  const remainingSpots = Math.max(
    0,
    registrationCount.total - registrationCount.confirmed
  );
  const hasImage = !!activity?.image_url;

  const modalContent = (
    <>
      {!hideDetailsModal && (
        <>
          <div className={styles.overlay} onClick={handleCloseWithAnimation} />
          <div className={styles.modalContainer}>
            {/* Close Button */}
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

            {/* Main Content Container */}
            <div className={styles.contentContainer}>
              {loading || closing ? (
                <div className={styles.loadingContainer}>
                  <OrganicCircles
                    mode="loading"
                    radius={0.15}
                    baseColor="#FFFFFF"
                  />
                </div>
              ) : (
                <>
                  {/* Image */}
                  {hasImage && (
                    <div className={styles.imageContainer}>
                      <img
                        src={activity.image_url}
                        alt={activity.title}
                        className={styles.activityImage}
                      />
                    </div>
                  )}

                  {/* Title Section */}
                  <div className={styles.titleSection}>
                    <h2 className={styles.titleText}>
                      {isGroup ? "קבוצת " : "סדנת "}
                      {activity?.title || ""}
                    </h2>
                  </div>

                  {/* Primary Info Section (Date & Time) */}
                  <div className={styles.primaryInfoSection}>
                    <div className={styles.dateTimeRow}>
                      <span className={styles.primaryInfoText}>
                        {dayName} {dayMonth}
                      </span>
                      <span className={styles.primaryInfoSeparator}>|</span>
                      <span className={styles.primaryInfoText}>
                        בשעה {formattedTime}
                      </span>
                    </div>
                  </div>

                  {/* Secondary Info Section (Location & Instructor) */}
                  <div className={styles.secondaryInfoSection}>
                    <p className={styles.secondaryInfoText}>
                      בסניף {branch} ב{location}
                    </p>
                    <p className={styles.secondaryInfoText}>
                      בהנחיית {instructor}
                    </p>
                  </div>

                  {/* Participants Section */}
                  <div className={styles.participantsSection}>
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

                  {/* Description Section */}
                  <div className={styles.descriptionSection}>
                    <p className={styles.descriptionText}>{description}</p>
                  </div>

                  {/* Admin: Participants Info & Registrations Button */}
                  {isAdmin && (
                    <>
                      <div className={styles.adminParticipantsSection}>
                        <p className={styles.adminParticipantsText}>
                          {registrationCount.confirmed}/
                          {registrationCount.total} נרשמים
                          {registrationCount.waitlist > 0 &&
                            ` (${registrationCount.waitlist} ברשימת המתנה)`}
                        </p>
                      </div>
                      <div className={styles.adminRegistrationsButtonSection}>
                        <Button
                          variant="tertiary"
                          tertiarySize="medium"
                          tertiaryWeight="semibold"
                          onClick={() => setIsRegistrationsModalOpen(true)}
                        >
                          לכל הנרשמים
                        </Button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Bottom Buttons Container */}
            {!loading && !closing && (
              <div className={styles.bottomButtonsContainer}>
                {isAdmin ? (
                  <>
                    <Button
                      size="L"
                      variant="primary"
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
                      {t("מחק/י")}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="L"
                      onClick={handleRegistrationToggle}
                      disabled={loading}
                    >
                      {regStatus === "none" ? "הרשמה" : "ביטול רישום"}
                    </Button>
                  </>
                )}
              </div>
            )}
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

      {isDeleteModalOpen && (
        <Popup
          content={t("האם את/ה בטוח/ה שברצונך למחוק פעילות זו?")}
          recommendation="פעולה זו תמחק את הפעילות לצמיתות"
          primaryButtonText={t("ביטול")}
          primaryButtonAction={() => setIsDeleteModalOpen(false)}
          secondaryButtonText={t("כן אני בטוח/ה")}
          secondaryButtonAction={handleDeleteConfirm}
          loading={loading}
          onClose={() => setIsDeleteModalOpen(false)}
        />
      )}

      {isAdmin && (
        <ActivityRegistrationsModal
          activityId={activityId}
          activityTitle={activity?.title || ""}
          isOpen={isRegistrationsModalOpen}
          onClose={() => setIsRegistrationsModalOpen(false)}
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
