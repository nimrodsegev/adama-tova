"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiUser, apiRegistrations } from "@/app/services/db_api";
import { useUser } from "@/app/contexts/UserContext";
import styles from "./UserManagementPage.module.css";

export default function UserManagementPage() {
  const { userProfile, loading: authLoading } = useUser();
  const router = useRouter();

  // Data States
  const [users, setUsers] = useState<any[]>([]);
  const [groupRequests, setGroupRequests] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"users" | "admins" | "groups">(
    "users"
  );
  const [activeSection, setActiveSection] = useState<"pending" | "approved">(
    "pending"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (userProfile?.role !== "admin") {
        router.push("/");
        return;
      }
      // Initial Fetch based on default tab
      if (activeTab === "groups") {
        fetchGroupRequests();
      } else {
        fetchUsers();
      }
    }
  }, [authLoading, userProfile, router, activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    const [data, error] = await apiUser.getAllUsers();
    if (error) alert("Error: " + error);
    else setUsers(data || []);
    setLoading(false);
  };

  const fetchGroupRequests = async () => {
    setLoading(true);
    const [data, error] = await apiRegistrations.getPendingRegistrations();
    if (error) console.error(error);
    else setGroupRequests(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  // --- USER HANDLERS ---
  const handleApproveUser = async (userId: string) => {
    setProcessingId(userId);
    const [_, error] = await apiUser.approveUser(userId);
    if (!error) {
      const user = users.find((u) => u.id === userId);
      if (user?.email) {
        fetch("/api/send-approval-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email, name: user.full_name }),
        }).catch((err) => console.error("Failed email:", err));
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_approved: true } : u))
      );
    }
    setProcessingId(null);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("למחוק משתמש זה?")) return;
    setProcessingId(userId);
    const [_, error] = await apiUser.deleteUser(userId);
    if (!error) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    }
    setProcessingId(null);
  };

  // --- GROUP HANDLERS ---
  const handleApproveGroup = async (regId: string) => {
    setProcessingId(regId);
    const [_, error] = await apiRegistrations.approveRegistration(regId);
    if (!error) {
      setGroupRequests((prev) => prev.filter((r) => r.id !== regId));
      alert("הבקשה אושרה בהצלחה");
    } else {
      alert("Error: " + error);
    }
    setProcessingId(null);
  };

  const handleRejectGroup = async (regId: string) => {
    if (!confirm("לדחות את הבקשה?")) return;
    setProcessingId(regId);
    const [_, error] = await apiRegistrations.rejectRegistration(regId);
    if (!error) {
      setGroupRequests((prev) => prev.filter((r) => r.id !== regId));
    }
    setProcessingId(null);
  };

  // --- FILTER LOGIC ---
  const isGroupsTab = activeTab === "groups";
  const isShowingAdmins = activeTab === "admins";

  const pendingUsers = users.filter(
    (u) =>
      !u.is_approved &&
      (isShowingAdmins ? u.role === "admin" : u.role !== "admin")
  );

  const approvedUsers = users.filter(
    (u) =>
      u.is_approved &&
      (isShowingAdmins ? u.role === "admin" : u.role !== "admin") &&
      (u.full_name?.includes(searchTerm) || u.email?.includes(searchTerm))
  );

  if (authLoading)
    return (
      <div className={styles.pageContainer}>
        <p className="text-loading">טוען...</p>
      </div>
    );

  return (
    <main className={styles.pageContainer}>
      <div className={styles.content}>
        {/* HEADER */}
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>ניהול משתמשים</h1>
          <button onClick={() => router.back()} className={styles.backButton}>
            ← חזרה
          </button>
        </div>

        {/* TABS - Select User Type */}
        <div className={styles.tabsContainer}>
          <button
            onClick={() => setActiveTab("users")}
            className={`${styles.tab} ${
              activeTab === "users" ? styles.tabActive : ""
            }`}
          >
            👥 משתמשים
          </button>
          <button
            onClick={() => setActiveTab("admins")}
            className={`${styles.tab} ${
              activeTab === "admins" ? styles.tabActive : ""
            }`}
          >
            🛡️ מנהלים
          </button>
          <button
            onClick={() => setActiveTab("groups")}
            className={`${styles.tab} ${
              activeTab === "groups" ? styles.tabActive : ""
            }`}
          >
            📅 קבוצות
          </button>
        </div>

        {/* SECTION SELECTOR - Pending vs Approved */}
        {!isGroupsTab && (
          <div className={styles.sectionSelector}>
            <button
              onClick={() => setActiveSection("pending")}
              className={`${styles.sectionButton} ${
                activeSection === "pending" ? styles.sectionButtonActive : ""
              }`}
            >
              ⏳ ממתינים לאישור ({pendingUsers.length})
            </button>
            <button
              onClick={() => setActiveSection("approved")}
              className={`${styles.sectionButton} ${
                activeSection === "approved" ? styles.sectionButtonActive : ""
              }`}
            >
              ✅ רשימה פעילה ({approvedUsers.length})
            </button>
          </div>
        )}

        {/* SCROLLABLE CONTENT AREA */}
        <div className={styles.scrollableArea}>
          {/* GROUPS TAB - PENDING ONLY */}
          {isGroupsTab && (
            <>
              <h2 className={styles.sectionTitle}>
                בקשות להצטרפות ({groupRequests.length})
              </h2>
              {groupRequests.length > 0 ? (
                <div className={styles.cardList}>
                  {groupRequests.map((req) => (
                    <div key={req.id} className={styles.pendingCard}>
                      <div className={styles.cardInfo}>
                        <div className={styles.cardTitle}>
                          {req.activities?.title || "פעילות"}
                        </div>
                        <div className={styles.cardSubtitle}>
                          👤 {req.users?.full_name}
                        </div>
                        <div className={styles.cardDate}>
                          📅{" "}
                          {new Date(req.created_at).toLocaleDateString("he-IL")}
                        </div>
                      </div>
                      <div className={styles.cardActions}>
                        <Link
                          href={`/AdminScreens/UserQuizPage?id=${req.users?.id}`}
                          className={styles.viewButton}
                        >
                          📄 פרטים
                        </Link>
                        <button
                          onClick={() => handleApproveGroup(req.id)}
                          disabled={!!processingId}
                          className={styles.approveButton}
                        >
                          ✓ אשר
                        </button>
                        <button
                          onClick={() => handleRejectGroup(req.id)}
                          disabled={!!processingId}
                          className={styles.rejectButton}
                        >
                          ✗ דחה
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-empty">אין בקשות.</p>
              )}
            </>
          )}

          {/* USERS/ADMINS TAB - PENDING SECTION */}
          {!isGroupsTab && activeSection === "pending" && (
            <>
              <h2 className={styles.sectionTitle}>
                ממתינים לאישור ({pendingUsers.length})
              </h2>
              {pendingUsers.length > 0 ? (
                <div className={styles.cardList}>
                  {pendingUsers.map((u) => (
                    <div key={u.id} className={styles.pendingCard}>
                      <div className={styles.cardInfo}>
                        <div className={styles.cardTitle}>
                          {u.full_name}
                          {isShowingAdmins && (
                            <span className={styles.adminBadge}>ADMIN</span>
                          )}
                        </div>
                        <div className={styles.cardSubtitle}>{u.email}</div>
                        <div className={styles.cardDate}>{u.phone}</div>
                      </div>
                      <div className={styles.cardActions}>
                        <Link
                          href={`/AdminScreens/UserQuizPage?id=${u.id}`}
                          className={styles.viewButton}
                        >
                          📄 שאלון
                        </Link>
                        <button
                          onClick={() => handleApproveUser(u.id)}
                          disabled={!!processingId}
                          className={styles.approveButton}
                        >
                          ✓ אשר
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          disabled={!!processingId}
                          className={styles.rejectButton}
                        >
                          ✗ דחה
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-empty">אין ממתינים לאישור.</p>
              )}
            </>
          )}

          {/* USERS/ADMINS TAB - APPROVED SECTION */}
          {!isGroupsTab && activeSection === "approved" && (
            <>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  רשימה פעילה ({approvedUsers.length})
                </h2>
                <input
                  type="text"
                  placeholder="חפש..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>

              {approvedUsers.length > 0 ? (
                <div className={styles.cardList}>
                  {approvedUsers.map((u) => (
                    <div key={u.id} className={styles.approvedCard}>
                      <div className={styles.cardInfo}>
                        <div className={styles.cardTitle}>{u.full_name}</div>
                        <div className={styles.cardSubtitle}>{u.email}</div>
                        <div className={styles.cardDate}>{u.phone}</div>
                      </div>
                      <div className={styles.cardActions}>
                        <Link
                          href={`/AdminScreens/UserQuizPage?id=${u.id}`}
                          className={styles.linkButton}
                        >
                          צפה בשאלון
                        </Link>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          disabled={!!processingId}
                          className={styles.deleteButton}
                        >
                          מחק
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-empty">לא נמצאו תוצאות.</p>
              )}
            </>
          )}
        </div>

        {/* ADD ADMIN LINK */}
        {!isGroupsTab && (
          <Link
            href="/AdminScreens/AddAdminPage"
            className={styles.addAdminLink}
          >
            + הוספת אדמין
          </Link>
        )}
      </div>
    </main>
  );
}
