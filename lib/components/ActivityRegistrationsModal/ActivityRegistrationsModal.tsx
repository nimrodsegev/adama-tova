"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { apiActivities } from "@/app/services/db_api";
import { HomeFilter } from "@/lib/components/UI/HomeFilter";
import UserProfileModal from "@/lib/components/UserProfileModal/UserProfileModal";
import OrganicCircles from "@/lib/components/OrganicCircles/OrganicCircles";
import Button from "@/lib/components/UI/Button";
import styles from "./ActivityRegistrationsModal.module.css";

interface Registration {
  id?: string;
  user_id?: string;
  status?: string;
  if_confirmed: boolean;
  wait_list_place?: number;
  users: {
    id: string;
    full_name: string;
    email?: string;
    phone?: string;
    circle?: string;
    quiz?: {
      circle?: string;
    };
  };
}

interface ActivityRegistrationsModalProps {
  activityId: string;
  activityTitle?: string;
  isOpen: boolean;
  onClose: () => void;
}

// Map English circle values to Hebrew
const CIRCLE_TO_HEBREW: Record<string, string> = {
  "Nova Survivor": "שורדי ושורדות המסיבות",
  "October 7 victim": "נפגעי טראומה 7.10 ומלחמת חרבות ברזל",
  "Shkulim parents": "הורים שכולים",
  "Shkulim Siblings": "אחים.ות שכולים",
  "Family of october 7 victim": "משפחות וקרובים של פצועים טראומה בגופם ובנפשם",
  "Rescue forces": "כוחות הצלה וחילוץ",
  "Residence of Otef Aza": "תושבי העוטף ומפונים",
  "Second or third": "מעגל שני ושלישי של משפחות השכול",
};

const getCircleHebrew = (user: Registration["users"]): string => {
  if (!user) return "";
  // First try quiz.circle (already in Hebrew)
  if (user.quiz?.circle) return user.quiz.circle;
  // Fall back to translating users.circle (English)
  if (user.circle) return CIRCLE_TO_HEBREW[user.circle] || user.circle;
  return "";
};

export default function ActivityRegistrationsModal({
  activityId,
  activityTitle: propTitle,
  isOpen,
  onClose,
}: ActivityRegistrationsModalProps) {
  const [activityTitle, setActivityTitle] = useState(propTitle || "");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState("all");
  const [closing, setClosing] = useState(false);

  // User profile modal state
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen && activityId) {
      setClosing(false);
      fetchData();
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

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch activity title if not provided
      if (!propTitle) {
        const [activityData] = await apiActivities.getById(activityId);
        if (activityData) {
          setActivityTitle(activityData.title);
        }
      }

      // Fetch registrations
      const [regsData, error] = await apiActivities.getParticipants(activityId);
      if (!error && regsData) {
        setRegistrations(regsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (userId: string) => {
    setSelectedUserId(userId);
    setIsProfileModalOpen(true);
  };

  const handleProfileModalClose = () => {
    setIsProfileModalOpen(false);
    setSelectedUserId(null);
  };

  if (!isOpen || !mounted) return null;

  // Filter registrations
  const confirmedRegs = registrations.filter((r) => r.if_confirmed === true);
  const waitlistRegs = registrations.filter((r) => r.if_confirmed === false);

  const filteredRegistrations =
    filter === "all"
      ? registrations
      : filter === "confirmed"
      ? confirmedRegs
      : waitlistRegs;

  const modalContent = (
    <>
      <div className={styles.overlay} onClick={handleCloseWithAnimation} />

      <div className={styles.modalContainer}>
        {/* Close Button */}
        <button className={styles.closeButton} onClick={handleCloseWithAnimation}>
          <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
            <line x1="2" y1="2" x2="18" y2="18" stroke="#F9F9F9" strokeWidth="1" />
            <line x1="18" y1="2" x2="2" y2="18" stroke="#F9F9F9" strokeWidth="1" />
          </svg>
        </button>

        <div className={styles.contentFrame}>
          {(loading || closing) ? (
            <div className={styles.loadingContainer}>
              <OrganicCircles mode="loading" radius={0.15} baseColor="#FFFFFF" />
            </div>
          ) : (
            <>
              {/* Title */}
              <h2 className={styles.titleText}>{activityTitle}</h2>

              {/* Filter Tabs */}
              <div className={styles.filterSection}>
                <HomeFilter
                  options={[
                    { id: "all", label: "הכל", count: registrations.length },
                    { id: "confirmed", label: "מאושרים", count: confirmedRegs.length },
                    { id: "waitlist", label: "ממתינים", count: waitlistRegs.length },
                  ]}
                  activeOption={filter}
                  onFilterChange={(newId) => setFilter(newId)}
                />
              </div>

              {/* Registrations List */}
              <div className={styles.registrationsList}>
                {filteredRegistrations.length > 0 ? (
                  filteredRegistrations.map((reg, index) => {
                    const isWaitlist = !reg.if_confirmed;
                    const isPending = reg.status === 'pending';
                    const user = reg.users;
                    const circle = getCircleHebrew(user);

                    return (
                      <div
                        key={user?.id || index}
                        className={`${styles.userCard} ${
                          isWaitlist ? styles.userCardWaitlist : ""
                        }`}
                      >
                        {/* User Info */}
                        <div className={styles.userInfo}>
                          <p className={`${styles.userName} ${isWaitlist ? styles.userNameWaitlist : ""}`}>
                            {user?.full_name || "משתמש"}
                          </p>
                          <p className={`${styles.userDetail} ${isWaitlist ? styles.userDetailWaitlist : ""}`}>
                            {user?.phone || ""}
                          </p>
                          <p className={`${styles.userDetail} ${isWaitlist ? styles.userDetailWaitlist : ""}`}>
                            {circle}
                          </p>
                          {isPending && (
                            <p className={styles.pendingStatus}>*מותנה באישור מנהל</p>
                          )}
                        </div>

                        {/* Profile Link */}
                        <Button
                          variant="tertiary"
                          colorType="white"
                          tertiarySize="small"
                          tertiaryWeight="bold"
                          onClick={() => handleViewProfile(user?.id)}
                          style={{ alignSelf: 'flex-end' }}
                        >
                          לצפייה בפרופיל
                        </Button>
                      </div>
                    );
                  })
                ) : (
                  <p className={styles.emptyText}>אין נרשמים</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {createPortal(modalContent, document.body)}

      {/* User Profile Modal */}
      {selectedUserId && (
        <UserProfileModal
          userId={selectedUserId}
          isOpen={isProfileModalOpen}
          onClose={handleProfileModalClose}
        />
      )}
    </>
  );
}
