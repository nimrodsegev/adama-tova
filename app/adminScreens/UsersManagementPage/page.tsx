"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiUser, apiRegistrations } from "@/app/services/db_api"; // 👈 Added apiRegistrations
import { useUser } from "@/app/contexts/UserContext";

export default function UserManagementPage() {
  const { userProfile, loading: authLoading } = useUser();
  const router = useRouter();

  // Data States
  const [users, setUsers] = useState<any[]>([]);
  const [groupRequests, setGroupRequests] = useState<any[]>([]); // 👈 New State for Groups

  const [loading, setLoading] = useState(true);

  // 👈 Added "groups" to the allowed tabs
  const [activeTab, setActiveTab] = useState<"users" | "admins" | "groups">(
    "users"
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
  }, [authLoading, userProfile, router, activeTab]); // Added activeTab dependency

  const fetchUsers = async () => {
    setLoading(true);
    const [data, error] = await apiUser.getAllUsers();
    if (error) alert("Error: " + error);
    else setUsers(data || []);
    setLoading(false);
  };

  // 👈 New Fetch for Group Requests
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
    if (!confirm("Are you sure you want to delete this user?")) return;
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

  // --- 🧠 FILTER LOGIC ---
  const isGroupsTab = activeTab === "groups";
  const isShowingAdmins = activeTab === "admins";

  // 1. Pending List Logic
  // If Groups tab -> show groupRequests
  // If User/Admin tab -> filter 'users' array
  const pendingUsers = users.filter(
    (u) =>
      !u.is_approved &&
      (isShowingAdmins ? u.role === "admin" : u.role !== "admin")
  );

  // 2. Approved List (Only for Users/Admins)
  const approvedUsers = users.filter(
    (u) =>
      u.is_approved &&
      (isShowingAdmins ? u.role === "admin" : u.role !== "admin") &&
      (u.full_name?.includes(searchTerm) || u.email?.includes(searchTerm))
  );

  if (authLoading)
    return <div className="p-10 text-center">טוען נתונים...</div>;

  return (
    <main className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            ניהול משתמשים וקבוצות
          </h1>
          <button onClick={() => router.back()} className="text-blue-600">
            ← חזרה
          </button>
        </div>

        {/* 🔘 TABS */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-3 rounded-lg font-bold transition-all text-lg flex-1 md:flex-none text-center border ${
              activeTab === "users"
                ? "bg-blue-600 text-white shadow-lg transform scale-105 border-blue-600"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            👥 משתמשים רגילים
          </button>
          <button
            onClick={() => setActiveTab("admins")}
            className={`px-6 py-3 rounded-lg font-bold transition-all text-lg flex-1 md:flex-none text-center border ${
              activeTab === "admins"
                ? "bg-purple-600 text-white shadow-lg transform scale-105 border-purple-600"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            🛡️ מנהלים
          </button>
          {/* 👇 NEW GROUPS TAB */}
          <button
            onClick={() => setActiveTab("groups")}
            className={`px-6 py-3 rounded-lg font-bold transition-all text-lg flex-1 md:flex-none text-center border ${
              activeTab === "groups"
                ? "bg-orange-500 text-white shadow-lg transform scale-105 border-orange-500"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            📅 אישורי קבוצות
          </button>
        </div>

        {/* ⏳ PENDING APPROVALS SECTION */}
        <section className="mb-10">
          <h2
            className={`text-xl font-bold mb-4 border-b-2 pb-2 ${
              activeTab === "admins"
                ? "text-purple-600 border-purple-200"
                : activeTab === "groups"
                ? "text-orange-600 border-orange-200"
                : "text-blue-600 border-blue-200"
            }`}
          >
            ⏳ {isGroupsTab ? "בקשות להצטרפות לקבוצה" : "ממתינים לאישור מערכת"}{" "}
            ({isGroupsTab ? groupRequests.length : pendingUsers.length})
          </h2>

          {/* 🅰️ GROUP REQUESTS VIEW */}
          {isGroupsTab ? (
            groupRequests.length > 0 ? (
              <div className="bg-white rounded-lg shadow border-l-4 border-orange-400 divide-y">
                {groupRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 flex flex-col md:flex-row justify-between items-center hover:bg-orange-50 transition-colors"
                  >
                    <div className="mb-2 md:mb-0">
                      <div className="font-bold text-lg text-gray-800">
                        {req.activities?.title || "פעילות לא ידועה"}
                      </div>
                      <div className="text-gray-600">
                        👤 {req.users?.full_name}
                      </div>
                      <div className="text-gray-500 text-sm">
                        📅{" "}
                        {new Date(req.created_at).toLocaleDateString("he-IL")}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      {/* Link to user profile/quiz if needed */}
                      <Link
                        href={`/AdminScreens/UserQuizPage?id=${req.users?.id}`}
                        className="bg-gray-100 text-gray-700 px-3 py-2 rounded font-medium hover:bg-gray-200"
                      >
                        📄 פרטי משתמש
                      </Link>
                      <button
                        onClick={() => handleApproveGroup(req.id)}
                        disabled={!!processingId}
                        className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded font-bold shadow-sm"
                      >
                        ✓ אשר
                      </button>
                      <button
                        onClick={() => handleRejectGroup(req.id)}
                        disabled={!!processingId}
                        className="bg-red-100 hover:bg-red-200 text-red-600 px-4 py-2 rounded font-bold"
                      >
                        ✗ דחה
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic bg-gray-50 p-4 rounded border text-center">
                אין בקשות לקבוצות הממתינות לאישור.
              </p>
            )
          ) : /* 🅱️ USER/ADMIN PENDING VIEW (Your original code) */
          pendingUsers.length > 0 ? (
            <div className="bg-white rounded-lg shadow border-l-4 border-orange-400 divide-y">
              {pendingUsers.map((u) => (
                <div
                  key={u.id}
                  className="p-4 flex flex-col md:flex-row justify-between items-center hover:bg-orange-50 transition-colors"
                >
                  <div className="mb-2 md:mb-0">
                    <div className="font-bold text-lg flex items-center gap-2">
                      {u.full_name}
                      {isShowingAdmins && (
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                          ADMIN REQUEST
                        </span>
                      )}
                    </div>
                    <div className="text-gray-600">{u.email}</div>
                    <div className="text-gray-500 text-sm">{u.phone}</div>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    <Link
                      href={`/AdminScreens/UserQuizPage?id=${u.id}`}
                      className="flex-1 md:flex-none text-center bg-gray-100 text-gray-700 px-4 py-2 rounded font-medium hover:bg-gray-200"
                    >
                      📄 שאלון
                    </Link>
                    <button
                      onClick={() => handleApproveUser(u.id)}
                      disabled={!!processingId}
                      className="flex-1 md:flex-none bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded font-bold shadow-sm"
                    >
                      ✓ אשר
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      disabled={!!processingId}
                      className="flex-1 md:flex-none bg-red-100 hover:bg-red-200 text-red-600 px-4 py-2 rounded font-bold"
                    >
                      ✗ דחה
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 italic bg-gray-50 p-4 rounded border text-center">
              אין {isShowingAdmins ? "מנהלים" : "משתמשים"} הממתינים לאישור כרגע.
            </p>
          )}
        </section>

        {/* ✅ APPROVED LIST SECTION (Hidden for Groups Tab) */}
        {!isGroupsTab && (
          <section>
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
              <h2 className="text-xl font-bold text-gray-700">
                רשימת {isShowingAdmins ? "מנהלים" : "משתמשים"} פעילים
              </h2>
              <input
                type="text"
                placeholder="חפש..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border rounded-lg px-4 py-2 w-full md:w-64 bg-white"
              />
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      שם
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      פרטים
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      מידע נוסף
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      פעולות
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {approvedUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-gray-900">
                          {u.full_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{u.email}</div>
                        <div>{u.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/AdminScreens/UserQuizPage?id=${u.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                        >
                          צפה בנתוני שאלון
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          disabled={!!processingId}
                          className="text-red-600 hover:text-red-900 font-bold bg-red-50 px-3 py-1 rounded"
                        >
                          מחק
                        </button>
                      </td>
                    </tr>
                  ))}
                  {approvedUsers.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        לא נמצאו תוצאות.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {!isGroupsTab && (
          <Link
            href="/AdminScreens/AddAdminPage"
            className="text-blue-600 hover:text-blue-800 font-medium hover:underline block mt-4 text-center md:text-right"
          >
            הוספת אדמין
          </Link>
        )}
      </div>
    </main>
  );
}
