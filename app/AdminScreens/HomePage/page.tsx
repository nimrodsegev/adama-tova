"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useUser } from "@/app/contexts/UserContext";
import {
  apiUser,
  apiActivities,
  apiRegistrations,
} from "@/app/services/db_api";
import { DEFAULTS } from "@/app/utils/motionParamsCalculator";
import OrganicCircles from "@/lib/components/OrganicCircles/OrganicCircles";
import OpenHours from "@/lib/components/UI/OpenHours";
import { HomeFilter } from "@/lib/components/UI/HomeFilter";
import UserApprovalCard from "@/lib/components/UI/UserApprovalCard";
import NewUserActivityCard from "@/lib/components/UI/NewUserActivityCard";
import EmptyState from "@/lib/components/UI/EmptyState";
import Button from "@/lib/components/UI/Button";
import ActivityDetailsModal from "@/lib/components/ActivityDetailsModal/ActivityDetailsModal";
import UserApprovalModal from "@/lib/components/UserApprovalModal/UserApprovalModal";
import ApprovalConfirmModal from "@/lib/components/ApprovalConfirmModal/ApprovalConfirmModal";
import styles from "./AdminHomePage.module.css";
import SmoothPageWrapper from "@/lib/components/UI/SmoothPageWrapper";

// --- Types ---
interface PendingUser {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  circle?: string;
  quiz?: {
    circle?: string;
  };
}

interface PendingGroupRegistration {
  id: string;
  created_at: string;
  users: {
    id: string;
    full_name: string;
    circle?: string;
    quiz?: {
      circle?: string;
    };
  };
  activities: {
    id: string;
    title: string;
  };
}

interface Activity {
  id: string;
  title: string;
  instructor?: string;
  date: string;
  start_time: string;
  max_participants?: number;
  current_participants?: number;
  waitlist_count?: number;
  series_id?: string;
  is_group?: boolean;
}

// --- Helpers ---
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

const getCircleHebrew = (
  user: { circle?: string; quiz?: { circle?: string } } | undefined
): string | undefined => {
  if (!user) return undefined;
  if (user.quiz?.circle) return user.quiz.circle;
  if (user.circle) return CIRCLE_TO_HEBREW[user.circle] || user.circle;
  return undefined;
};

export default function AdminHomePage() {
  const { userProfile, loading: userLoading } = useUser();
  const [activeFilter, setActiveFilter] = useState<"pending" | "approved">(
    "pending"
  );
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [pendingGroupRegs, setPendingGroupRegs] = useState<
    PendingGroupRegistration[]
  >([]);
  const [upcomingActivities, setUpcomingActivities] = useState<Activity[]>([]);

  const [mounting, setMounting] = useState(true);

  // FAB & UI State
  const [isFabOpen, setIsFabOpen] = useState(false);

  // Refs for Scroll (Observer ref removed)
  const pageContainerRef = useRef<HTMLDivElement>(null);

  // Circle Config State
  const [bgCircleConfig, setBgCircleConfig] = useState({
    radius: 0.07,
    x: 0.47,
    y: 0.25,
  });

  // Modal States
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(
    null
  );
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserType, setSelectedUserType] = useState<"initial" | "group">(
    "initial"
  );
  const [selectedGroupName, setSelectedGroupName] = useState<
    string | undefined
  >(undefined);
  const [selectedRequestDate, setSelectedRequestDate] = useState<
    string | undefined
  >(undefined);
  const [selectedRegistrationId, setSelectedRegistrationId] = useState<
    string | null
  >(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // Confirmation Modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject">(
    "approve"
  );
  const [confirmUserName, setConfirmUserName] = useState("");
  const [confirmType, setConfirmType] = useState<"initial" | "group">(
    "initial"
  );
  const [confirmUserId, setConfirmUserId] = useState<string | null>(null);
  const [confirmRegistrationId, setConfirmRegistrationId] = useState<
    string | null
  >(null);

  const OPENING_HOURS = {
    0: { open: "16:00", close: "22:00" },
    2: { open: "16:00", close: "22:00" },
    3: { open: "16:00", close: "22:00" },
    5: { open: "16:00", close: "22:00" },
  };

  const todayHours = (() => {
    const today = new Date().getDay();
    // @ts-ignore
    return OPENING_HOURS[today] || null;
  })();

  // --- 1. Circle Config Resize Logic ---
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      let newConfig = { radius: 0.09, x: 0.45, y: 0.1 };

      if (width < 380) {
        newConfig.radius = 0.06;
        newConfig.x = 0.5;
        newConfig.y = 0.25;
      } else if (width > 600) {
        newConfig.radius = 0.12;
        newConfig.x = 0.5;
        newConfig.y = 0.25;
      }

      if (height < 800) newConfig.y = 0.11;
      if (height < 700) {
        newConfig.radius = Math.min(newConfig.radius, 0.06);
        newConfig.y = 0.25;
      }
      if (height < 600) {
        newConfig.radius = Math.min(newConfig.radius, 0.05);
        newConfig.y = 0.17;
      }

      setBgCircleConfig(newConfig);
    };

    handleResize(); // Initial call
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- 2. Data Fetching ---
  useEffect(() => {
    fetchData();
    const timer = setTimeout(() => {
      setMounting(false);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // --- (Removed Sticky Header Observer) ---

  const fetchData = async () => {
    // Users
    const [users, userError] = await apiUser.getAllUsers();
    if (!userError && users) {
      const pending = users.filter(
        (u: any) => !u.is_approved && u.role !== "admin"
      );
      setPendingUsers(pending);
    }
    // Group Regs
    const [groupRegs, groupError] =
      await apiRegistrations.getPendingRegistrations();
    if (!groupError && groupRegs && Array.isArray(groupRegs)) {
      setPendingGroupRegs(groupRegs);
    }
    // Activities
    const [activities, actError] = await apiActivities.getAll();
    if (!actError && activities) {
      const seenSeriesIds = new Set<string>();
      const deduped: Activity[] = [];
      for (const activity of activities) {
        if (activity.series_id) {
          if (!seenSeriesIds.has(activity.series_id)) {
            seenSeriesIds.add(activity.series_id);
            deduped.push(activity);
          }
        } else {
          deduped.push(activity);
        }
      }
      setUpcomingActivities(deduped);
    }
  };

  // --- Handlers ---
  const handleApproveUser = async (userId: string) => {
    const [, error] = await apiUser.approveUser(userId);
    if (!error) {
      // Send approval email
      const user = pendingUsers.find((u) => u.id === userId);
      if (user?.email) {
        fetch('/api/send-approval-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, name: user.full_name }),
        }).catch(err => console.error("Failed to send approval email:", err));
      }
      fetchData();
    }
  };
  const handleRejectUser = async (userId: string) => {
    const [, error] = await apiUser.deleteUser(userId);
    if (!error) fetchData();
  };
  const handleApproveGroupReg = async (registrationId: string) => {
    const [, error] = await apiRegistrations.approveRegistration(
      registrationId
    );
    if (!error) fetchData();
  };
  const handleRejectGroupReg = async (registrationId: string) => {
    const [, error] = await apiRegistrations.rejectRegistration(registrationId);
    if (!error) fetchData();
  };

  const openConfirmForUser = (
    userId: string,
    userName: string,
    action: "approve" | "reject"
  ) => {
    setConfirmUserId(userId);
    setConfirmRegistrationId(null);
    setConfirmUserName(userName);
    setConfirmType("initial");
    setConfirmAction(action);
    setIsConfirmModalOpen(true);
  };

  const openConfirmForGroup = (
    registrationId: string,
    userName: string,
    action: "approve" | "reject"
  ) => {
    setConfirmUserId(null);
    setConfirmRegistrationId(registrationId);
    setConfirmUserName(userName);
    setConfirmType("group");
    setConfirmAction(action);
    setIsConfirmModalOpen(true);
  };

  const handleConfirm = async () => {
    if (confirmType === "initial" && confirmUserId) {
      if (confirmAction === "approve") {
        await handleApproveUser(confirmUserId);
      } else {
        await handleRejectUser(confirmUserId);
      }
    } else if (confirmType === "group" && confirmRegistrationId) {
      if (confirmAction === "approve") {
        await handleApproveGroupReg(confirmRegistrationId);
      } else {
        await handleRejectGroupReg(confirmRegistrationId);
      }
    }
    setIsConfirmModalOpen(false);
    if (isUserModalOpen) handleUserModalClose();
  };

  const handleActivityModalClose = () => {
    setIsActivityModalOpen(false);
    setSelectedActivityId(null);
  };
  const handleUserModalClose = () => {
    setIsUserModalOpen(false);
    setSelectedUserId(null);
    setSelectedGroupName(undefined);
    setSelectedRegistrationId(null);
  };

  const handleUserCardClick = (userId: string, requestDate?: string) => {
    setSelectedUserId(userId);
    setSelectedUserType("initial");
    setSelectedGroupName(undefined);
    setSelectedRequestDate(requestDate);
    setSelectedRegistrationId(null);
    setIsUserModalOpen(true);
  };
  const handleGroupCardClick = (
    userId: string,
    groupName: string,
    registrationId: string,
    requestDate?: string
  ) => {
    setSelectedUserId(userId);
    setSelectedUserType("group");
    setSelectedGroupName(groupName);
    setSelectedRequestDate(requestDate);
    setSelectedRegistrationId(registrationId);
    setIsUserModalOpen(true);
  };

  const handleModalApprove = () => {
    if (selectedUserType === "initial" && selectedUserId) {
      const user = pendingUsers.find((u) => u.id === selectedUserId);
      openConfirmForUser(selectedUserId, user?.full_name || "משתמש", "approve");
    } else if (selectedUserType === "group" && selectedRegistrationId) {
      const reg = pendingGroupRegs.find((r) => r.id === selectedRegistrationId);
      openConfirmForGroup(
        selectedRegistrationId,
        reg?.users?.full_name || "משתמש",
        "approve"
      );
    }
  };

  const handleModalReject = () => {
    if (selectedUserType === "initial" && selectedUserId) {
      const user = pendingUsers.find((u) => u.id === selectedUserId);
      openConfirmForUser(selectedUserId, user?.full_name || "משתמש", "reject");
    } else if (selectedUserType === "group" && selectedRegistrationId) {
      const reg = pendingGroupRegs.find((r) => r.id === selectedRegistrationId);
      openConfirmForGroup(
        selectedRegistrationId,
        reg?.users?.full_name || "משתמש",
        "reject"
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    return `${day}.${month}`;
  };

  const firstName = userProfile?.full_name?.split(" ")[0] || "מנהל";

  return (
    <SmoothPageWrapper isLoading={userLoading || mounting}>
      <div className={styles.pageContainer} dir="rtl" ref={pageContainerRef}>
        {/* 1. Open Hours */}
        <div className={styles.openHoursWrapper}>
          {todayHours ? (
            <OpenHours
              startTime={todayHours.open}
              endTime={todayHours.close}
              isOpen={true}
            />
          ) : (
            <OpenHours isOpen={false} />
          )}
        </div>

        {/* 2. Circles */}
        <div className={styles.circlesContainer}>
          <OrganicCircles
            mode="breathing"
            radius={bgCircleConfig.radius}
            position={{ x: bgCircleConfig.x, y: bgCircleConfig.y }}
            layers={DEFAULTS.layers}
            smoothness={DEFAULTS.smoothness}
            complexity={DEFAULTS.complexity}
            elongation={DEFAULTS.elongation}
            opacity={DEFAULTS.opacity}
            strokeWidth={DEFAULTS.strokeWidth}
            baseColor="#FFFFFF"
          />
        </div>

        {/* 3. Greeting - (Static) */}
        <div className={styles.greetingSection}>
          <h1 className={styles.greetingTitle}>היי {firstName},</h1>
          <p className={styles.greetingSubtitle}>המרחב כאן בשבילך</p>
        </div>

        {/* 4. Content */}
        <div className={styles.filterContainer}>
          <HomeFilter
            options={[
              {
                id: "pending",
                label: "ממתינים לאישור",
                count: pendingUsers.length + pendingGroupRegs.length,
              },
              {
                id: "approved",
                label: "המפגשים הבאים",
                count: upcomingActivities.length,
              },
            ]}
            activeOption={activeFilter}
            onFilterChange={(id) =>
              setActiveFilter(id as "pending" | "approved")
            }
          />
        </div>

        <div className={styles.cardsContainer}>
          {activeFilter === "pending" ? (
            pendingUsers.length > 0 || pendingGroupRegs.length > 0 ? (
              <>
                {pendingUsers.map((pendingUser) => (
                  <UserApprovalCard
                    key={`user-${pendingUser.id}`}
                    type="initial"
                    userName={pendingUser.full_name || "משתמש"}
                    requestDate={formatDate(pendingUser.created_at)}
                    circle={getCircleHebrew(pendingUser)}
                    onApprove={() =>
                      openConfirmForUser(
                        pendingUser.id,
                        pendingUser.full_name || "המשתמש",
                        "approve"
                      )
                    }
                    onReject={() =>
                      openConfirmForUser(
                        pendingUser.id,
                        pendingUser.full_name || "המשתמש",
                        "reject"
                      )
                    }
                    onClick={() =>
                      handleUserCardClick(
                        pendingUser.id,
                        formatDate(pendingUser.created_at)
                      )
                    }
                  />
                ))}
                {pendingGroupRegs.map((reg) => (
                  <UserApprovalCard
                    key={`group-${reg.id}`}
                    type="group"
                    userName={reg.users?.full_name || "משתמש"}
                    requestDate={formatDate(reg.created_at)}
                    circle={getCircleHebrew(reg.users)}
                    groupName={reg.activities?.title}
                    onApprove={() =>
                      openConfirmForGroup(
                        reg.id,
                        reg.users?.full_name || "המשתמש",
                        "approve"
                      )
                    }
                    onReject={() =>
                      openConfirmForGroup(
                        reg.id,
                        reg.users?.full_name || "המשתמש",
                        "reject"
                      )
                    }
                    onClick={() =>
                      handleGroupCardClick(
                        reg.users?.id,
                        reg.activities?.title || "",
                        reg.id,
                        formatDate(reg.created_at)
                      )
                    }
                  />
                ))}
              </>
            ) : (
              <EmptyState message="אין ממתינים לאישור" />
            )
          ) : upcomingActivities.length > 0 ? (
            upcomingActivities.map((activity) => (
              <NewUserActivityCard
                key={activity.id}
                id={activity.id}
                title={activity.title}
                instructor={activity.instructor || "לא צוין"}
                date={activity.date}
                startTime={activity.start_time}
                currentParticipants={activity.current_participants || 0}
                maxParticipants={activity.max_participants || 0}
                waitlistCount={activity.waitlist_count || 0}
                isGroup={activity.is_group || !!activity.series_id}
              />
            ))
          ) : (
            <EmptyState message="אין מפגשים קרובים" />
          )}
        </div>

        {/* FAB & Buttons */}
        <div
          className={`${styles.actionButtons} ${
            isFabOpen ? styles.actionButtonsOpen : ""
          }`}
        >
          <Button size="L" href="/AdminScreens/addNotification">
            להוספת הודעה
          </Button>
          <Button size="L" href="/AdminScreens/AddActivityPage">
            להוספת פעילות
          </Button>
        </div>

        <button
          className={`${styles.fabButton} ${
            isFabOpen ? styles.fabButtonOpen : ""
          }`}
          onClick={() => setIsFabOpen(!isFabOpen)}
          aria-label={isFabOpen ? "סגור תפריט" : "פתח תפריט"}
        >
          <Image src="/icons/plus_fab_icon.svg" alt="" width={56} height={56} />
        </button>

        {/* Modals */}
        {selectedActivityId && (
          <ActivityDetailsModal
            activityId={selectedActivityId}
            isOpen={isActivityModalOpen}
            onClose={handleActivityModalClose}
            onRegistrationChange={fetchData}
          />
        )}
        {selectedUserId && (
          <UserApprovalModal
            userId={selectedUserId}
            type={selectedUserType}
            groupName={selectedGroupName}
            requestDate={selectedRequestDate}
            isOpen={isUserModalOpen}
            onClose={handleUserModalClose}
            onApprove={handleModalApprove}
            onReject={handleModalReject}
          />
        )}
        <ApprovalConfirmModal
          isOpen={isConfirmModalOpen}
          userName={confirmUserName}
          action={confirmAction}
          type={confirmType}
          onConfirm={handleConfirm}
          onClose={() => setIsConfirmModalOpen(false)}
        />
      </div>
    </SmoothPageWrapper>
  );
}
