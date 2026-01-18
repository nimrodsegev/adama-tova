"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!user || loading || isSubmitting || isAdmin) return;

    if (regStatus !== "none") {
      setIsCancelModalOpen(true);
      return;
    }

    onMotionChange?.("start");
    setIsSubmitting(true);

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
      setIsSubmitting(false);
    }
  };

  const handleCancelConfirm = async () => {
    if (!user || loading || isSubmitting) return;

    setIsCancelModalOpen(false);
    onMotionChange?.("start");
    setIsSubmitting(true);

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
      setIsSubmitting(false);
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

  const getParticipantsText = () => {
    const { confirmed, total, waitlist } = registrationCount;
    const remaining = Math.max(0, total - confirmed);
    const isFull = confirmed >= total;

    if (regStatus === "waitlist" && waitlistPosition) {
      return `(יש ${waitlist} ברשימת המתנה, מיקומך: ${waitlistPosition})`;
    }

    if (isFull) {
      if (waitlist > 0) {
        return `(${waitlist} ברשימת המתנה)`;
      } else {
        return "(ניתן להירשם לרשימת המתנה)";
      }
    }

    return `(נותרו ${remaining} מקומות)`;
  };

  if (!isOpen || !mounted) return null;

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
  const hasImage = !!activity?.image_url;

  const participantsText = getParticipantsText();

  const modalContent = (
    <>
      {!hideDetailsModal && (
        <>
          <div className={styles.overlay} onClick={handleCloseWithAnimation} />

          <div className={styles.modalContainer}>
            {/* 1. CLOSE BUTTON (Flex Item - Aligned Start/Right) */}
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

            {/* 2. SCROLLABLE CONTENT */}
            <div className={styles.contentContainer}>
              {loading ? (
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

                  <div
                    className={`${styles.titleSection} ${
                      !hasImage ? styles.noImageSpacing : ""
                    }`}
                  >
                    <h2 className={styles.titleText}>
                      {isGroup ? "קבוצת " : "סדנת "}
                      {activity?.title || ""}
                    </h2>
                  </div>

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

                  <div className={styles.secondaryInfoSection}>
                    <p className={styles.secondaryInfoText}>
                      {`בסניף ${branch}${location ? ` ב${location}` : ""}`}
                    </p>
                    <p className={styles.secondaryInfoText}>
                      בהנחיית {instructor}
                    </p>
                  </div>

                  <div className={styles.participantsSection}>
                    <p className={styles.secondaryInfoText}>
                      משתתפים: {registrationCount.confirmed}/
                      {registrationCount.total} {participantsText}
                    </p>
                  </div>

                  <div className={styles.descriptionSection}>
                    <p className={styles.descriptionText}>{description}</p>
                  </div>

                  {isAdmin && (
                    <div className={styles.adminControlsContainer}>
                      <p className={styles.adminParticipantsText}>
                        {registrationCount.confirmed}/{registrationCount.total}{" "}
                        נרשמים
                        {registrationCount.waitlist > 0 &&
                          ` (${registrationCount.waitlist} ברשימת המתנה)`}
                      </p>

                      <Button
                        variant="tertiary"
                        colorType="white"
                        tertiarySize="medium"
                        tertiaryWeight="semibold"
                        onClick={() => setIsRegistrationsModalOpen(true)}
                        className={styles.adminRegistrationsButton}
                      >
                        לכל הנרשמים
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* 3. FIXED BOTTOM BUTTONS */}
            {!loading && !closing && (
              <div className={styles.bottomButtonsContainer}>
                {isAdmin ? (
                  <>
                    <Button
                      size="L"
                      variant="secondary"
                      onClick={handleDelete}
                      disabled={loading || isSubmitting}
                    >
                      {t("מחיקה")}
                    </Button>
                    <Button
                      size="L"
                      variant="primary"
                      onClick={handleEdit}
                      disabled={loading || isSubmitting}
                    >
                      {t("עריכה")}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="L"
                      onClick={handleRegistrationToggle}
                      disabled={loading || isSubmitting}
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
