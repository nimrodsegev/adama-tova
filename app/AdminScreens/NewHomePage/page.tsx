"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/app/contexts/UserContext";
import { apiUser, apiActivities, apiRegistrations } from "@/app/services/db_api";
import OrganicCircles from "@/lib/components/OrganicCircles/OrganicCircles";
import { HomeFilter, ADMIN_FILTER_OPTIONS } from "@/lib/components/UI/HomeFilter";
import UserApprovalCard from "@/lib/components/UI/UserApprovalCard";
import NewAdminActivityCard from "@/lib/components/UI/NewAdminActivityCard";
import Button from "@/lib/components/UI/Button";
import ActivityDetailsModal from "@/lib/components/ActivityDetailsModal/ActivityDetailsModal";
import UserApprovalModal from "@/lib/components/UserApprovalModal/UserApprovalModal";
import ApprovalConfirmModal from "@/lib/components/ApprovalConfirmModal/ApprovalConfirmModal";
import styles from "./NewHomePage.module.css";

interface PendingUser {
  id: string;
  full_name: string;
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
}

const HEBREW_DAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

export default function NewAdminHomePage() {
  const { userProfile, loading: userLoading } = useUser();
  const [activeFilter, setActiveFilter] = useState<"pending" | "approved">("pending");
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [pendingGroupRegs, setPendingGroupRegs] = useState<PendingGroupRegistration[]>([]);
  const [upcomingActivities, setUpcomingActivities] = useState<Activity[]>([]);

  // Activity modal state
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

  // User details modal state
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserType, setSelectedUserType] = useState<"initial" | "group">("initial");
  const [selectedGroupName, setSelectedGroupName] = useState<string | undefined>(undefined);
  const [selectedRegistrationId, setSelectedRegistrationId] = useState<string | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // Confirmation modal state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject">("approve");
  const [confirmUserName, setConfirmUserName] = useState("");
  const [confirmType, setConfirmType] = useState<"initial" | "group">("initial");
  const [confirmUserId, setConfirmUserId] = useState<string | null>(null);
  const [confirmRegistrationId, setConfirmRegistrationId] = useState<string | null>(null);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Fetch pending users (initial approval)
    const [users, userError] = await apiUser.getAllUsers();
    if (!userError && users) {
      const pending = users.filter(
        (u: any) => !u.is_approved && u.role !== "admin"
      );
      setPendingUsers(pending);
    }

    // Fetch pending group registrations
    const [groupRegs, groupError] = await apiRegistrations.getPendingRegistrations();
    if (!groupError && groupRegs) {
      setPendingGroupRegs(groupRegs);
    }

    // Fetch upcoming activities (dedupe by series_id)
    const [activities, actError] = await apiActivities.getAll();
    if (!actError && activities) {
      const seenSeriesIds = new Set<string>();
      const deduped: Activity[] = [];

      for (const activity of activities) {
        if (activity.series_id) {
          // Group activity - only keep first one per series
          if (!seenSeriesIds.has(activity.series_id)) {
            seenSeriesIds.add(activity.series_id);
            deduped.push(activity);
          }
        } else {
          // Regular activity - always include
          deduped.push(activity);
        }
      }
      setUpcomingActivities(deduped);
    }
  };

  // Format date to DD.MM, יום X
  const formatDayHebrew = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${day}.${month}, יום ${HEBREW_DAYS[date.getDay()]}`;
  };

  // Handle approve user (called after confirmation)
  const handleApproveUser = async (userId: string) => {
    const [, error] = await apiUser.approveUser(userId);
    if (!error) {
      fetchData();
    }
  };

  // Handle reject user (called after confirmation)
  const handleRejectUser = async (userId: string) => {
    const [, error] = await apiUser.deleteUser(userId);
    if (!error) {
      fetchData();
    }
  };

  // Handle approve group registration (called after confirmation)
  const handleApproveGroupReg = async (registrationId: string) => {
    const [, error] = await apiRegistrations.approveRegistration(registrationId);
    if (!error) {
      fetchData();
    }
  };

  // Handle reject group registration (called after confirmation)
  const handleRejectGroupReg = async (registrationId: string) => {
    const [, error] = await apiRegistrations.rejectRegistration(registrationId);
    if (!error) {
      fetchData();
    }
  };

  // Open confirmation modal for initial user approval
  const openConfirmForUser = (userId: string, userName: string, action: "approve" | "reject") => {
    setConfirmUserId(userId);
    setConfirmRegistrationId(null);
    setConfirmUserName(userName);
    setConfirmType("initial");
    setConfirmAction(action);
    setIsConfirmModalOpen(true);
  };

  // Open confirmation modal for group registration
  const openConfirmForGroup = (registrationId: string, userName: string, action: "approve" | "reject") => {
    setConfirmUserId(null);
    setConfirmRegistrationId(registrationId);
    setConfirmUserName(userName);
    setConfirmType("group");
    setConfirmAction(action);
    setIsConfirmModalOpen(true);
  };

  // Handle confirmation
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
    // Also close user details modal if open
    if (isUserModalOpen) {
      handleUserModalClose();
    }
  };

  // Handle activity card click
  const handleActivityClick = (activityId: string) => {
    setSelectedActivityId(activityId);
    setIsActivityModalOpen(true);
  };

  // Handle activity modal close
  const handleActivityModalClose = () => {
    setIsActivityModalOpen(false);
    setSelectedActivityId(null);
  };

  // Handle user approval card click (initial) - opens details modal
  const handleUserCardClick = (userId: string) => {
    setSelectedUserId(userId);
    setSelectedUserType("initial");
    setSelectedGroupName(undefined);
    setSelectedRegistrationId(null);
    setIsUserModalOpen(true);
  };

  // Handle group registration card click - opens details modal
  const handleGroupCardClick = (userId: string, groupName: string, registrationId: string) => {
    setSelectedUserId(userId);
    setSelectedUserType("group");
    setSelectedGroupName(groupName);
    setSelectedRegistrationId(registrationId);
    setIsUserModalOpen(true);
  };

  // Handle user modal close
  const handleUserModalClose = () => {
    setIsUserModalOpen(false);
    setSelectedUserId(null);
    setSelectedGroupName(undefined);
    setSelectedRegistrationId(null);
  };

  // Handle approve from user details modal - opens confirm modal
  const handleModalApprove = () => {
    if (selectedUserType === "initial" && selectedUserId) {
      const user = pendingUsers.find(u => u.id === selectedUserId);
      openConfirmForUser(selectedUserId, user?.full_name || "המשתמש", "approve");
    } else if (selectedUserType === "group" && selectedRegistrationId) {
      const reg = pendingGroupRegs.find(r => r.id === selectedRegistrationId);
      openConfirmForGroup(selectedRegistrationId, reg?.users?.full_name || "המשתמש", "approve");
    }
  };

  // Handle reject from user details modal - opens confirm modal
  const handleModalReject = () => {
    if (selectedUserType === "initial" && selectedUserId) {
      const user = pendingUsers.find(u => u.id === selectedUserId);
      openConfirmForUser(selectedUserId, user?.full_name || "המשתמש", "reject");
    } else if (selectedUserType === "group" && selectedRegistrationId) {
      const reg = pendingGroupRegs.find(r => r.id === selectedRegistrationId);
      openConfirmForGroup(selectedRegistrationId, reg?.users?.full_name || "המשתמש", "reject");
    }
  };

  // Format date to DD.MM
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    return `${day}.${month}`;
  };

  if (userLoading) {
    return (
      <div className={styles.loadingContainer} dir="rtl">
        טוען...
      </div>
    );
  }

  const firstName = userProfile?.full_name?.split(" ")[0] || "מנהל";

  return (
    <div className={styles.pageContainer} dir="rtl">
      {/* Decorative Circles - positioned at top */}
      <OrganicCircles
        mode="breathing"
        radius={0.08}
        layers={3}
        smoothness={0.5}
        complexity={0.5}
        elongation={0.3}
        opacity={0.7}
        strokeWidth={2.3}
        position={{ x: 0.5, y: 0.1 }}
        baseColor="#FFFFFF"
      />

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Greeting Section */}
        <div className={styles.greetingSection}>
          <h1 className={styles.greetingTitle}>היי {firstName},</h1>
          <p className={styles.greetingSubtitle}>המרחב כאן בשבילך</p>
        </div>

        {/* Opening Hours Bar */}
        <button className={styles.openingHoursBar}>
          <div className={styles.openingHoursContent}>
            <span className={styles.openingHoursText}>
              המרחב פתוח היום 16:00 עד 22:00
            </span>
            <div className={styles.editButton}>
              <span className={styles.editText}>עריכה</span>
              <span className={styles.editArrow}></span>
            </div>
          </div>
        </button>

        {/* Filter Tabs */}
        <div className={styles.filterContainer}>
          <HomeFilter
            options={ADMIN_FILTER_OPTIONS}
            activeOption={activeFilter}
            onFilterChange={(id) => setActiveFilter(id as "pending" | "approved")}
            size="medium"
          />
        </div>

        {/* Section Title */}
        <h2 className={styles.sectionTitle}>
          {activeFilter === "pending"
            ? `ממתינים לאישור (${pendingUsers.length + pendingGroupRegs.length})`
            : `המפגשים הבאים (${upcomingActivities.length})`}
        </h2>

        {/* Cards Container */}
        <div className={styles.cardsContainer}>
          {activeFilter === "pending" ? (
            // Pending Users Cards (Initial + Group)
            (pendingUsers.length > 0 || pendingGroupRegs.length > 0) ? (
              <>
                {/* Initial approval cards */}
                {pendingUsers.map((pendingUser) => (
                  <UserApprovalCard
                    key={`user-${pendingUser.id}`}
                    type="initial"
                    userName={pendingUser.full_name || "משתמש"}
                    requestDate={formatDate(pendingUser.created_at)}
                    circle={pendingUser.quiz?.circle}
                    onApprove={() => openConfirmForUser(pendingUser.id, pendingUser.full_name || "המשתמש", "approve")}
                    onReject={() => openConfirmForUser(pendingUser.id, pendingUser.full_name || "המשתמש", "reject")}
                    onClick={() => handleUserCardClick(pendingUser.id)}
                  />
                ))}
                {/* Group approval cards */}
                {pendingGroupRegs.map((reg) => (
                  <UserApprovalCard
                    key={`group-${reg.id}`}
                    type="group"
                    userName={reg.users?.full_name || "משתמש"}
                    requestDate={formatDate(reg.created_at)}
                    circle={reg.users?.quiz?.circle}
                    groupName={reg.activities?.title}
                    onApprove={() => openConfirmForGroup(reg.id, reg.users?.full_name || "המשתמש", "approve")}
                    onReject={() => openConfirmForGroup(reg.id, reg.users?.full_name || "המשתמש", "reject")}
                    onClick={() => handleGroupCardClick(reg.users?.id, reg.activities?.title || "", reg.id)}
                  />
                ))}
              </>
            ) : (
              <p className={styles.emptyState}>אין משתמשים ממתינים לאישור</p>
            )
          ) : (
            // Upcoming Activities Cards
            upcomingActivities.length > 0 ? (
              upcomingActivities.map((activity) => {
                const totalRegistrations = (activity.current_participants || 0) + (activity.waitlist_count || 0);
                return (
                  <NewAdminActivityCard
                    key={activity.id}
                    id={activity.id}
                    title={activity.title}
                    instructor={activity.instructor || "לא צוין"}
                    day={formatDayHebrew(activity.date)}
                    startTime={activity.start_time}
                    currentParticipants={totalRegistrations}
                    maxParticipants={activity.max_participants || 0}
                    onClick={() => handleActivityClick(activity.id)}
                  />
                );
              })
            ) : (
              <p className={styles.emptyState}>אין מפגשים קרובים</p>
            )
          )}
        </div>

      </div>

      {/* Bottom Buttons */}
      <div className={styles.bottomButtons}>
        <Button size="M" href="/AdminScreens/addNotification">
          להוספת הודעה
        </Button>
        <Button size="M" href="/AdminScreens/AddActivityPage">
          להוספת פעילות
        </Button>
      </div>

      {/* Activity Details Modal */}
      {selectedActivityId && (
        <ActivityDetailsModal
          activityId={selectedActivityId}
          isOpen={isActivityModalOpen}
          onClose={handleActivityModalClose}
          onRegistrationChange={fetchData}
        />
      )}

      {/* User Approval Details Modal */}
      {selectedUserId && (
        <UserApprovalModal
          userId={selectedUserId}
          type={selectedUserType}
          groupName={selectedGroupName}
          isOpen={isUserModalOpen}
          onClose={handleUserModalClose}
          onApprove={handleModalApprove}
          onReject={handleModalReject}
        />
      )}

      {/* Confirmation Modal */}
      <ApprovalConfirmModal
        isOpen={isConfirmModalOpen}
        userName={confirmUserName}
        action={confirmAction}
        type={confirmType}
        onConfirm={handleConfirm}
        onClose={() => setIsConfirmModalOpen(false)}
      />
    </div>
  );
}
