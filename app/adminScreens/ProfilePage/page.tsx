"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useIvrita } from "@/app/contexts/IvritaContext";

// You'll replace this with your actual fetch function later
const fetchUserProfile = async () => {
  // Placeholder - replace with your Supabase fetch function
  return {
    fullName: "נדב נבון",
    phoneNumber: "050-1234567",
    email: "user@example.com",
  };
};

type NotificationType = "email" | "sms" | "push";

export default function ProfilePage() {
  const router = useRouter();
  const { t } = useIvrita();
  const [profile, setProfile] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
  });
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await fetchUserProfile();
      setProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (type: NotificationType) => {
    setNotifications((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleLogout = () => {
    // Add your logout logic here
    router.push("/logout");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">טוען...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">פרופיל אישי</h1>

        {/* Personal Details Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            פרטים אישיים
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                שם מלא
              </label>
              <div className="text-lg text-gray-900">{profile.fullName}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                מספר טלפון
              </label>
              <div className="text-lg text-gray-900">{profile.phoneNumber}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                אימייל
              </label>
              <div className="text-lg text-gray-900">{profile.email}</div>
            </div>
          </div>
        </div>

        {/* Notification Settings Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            הגדרות התראות
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">התראות דוא&quot;ל</span>
              <button
                onClick={() => handleNotificationChange("email")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.email ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.email ? "translate-x-1" : "translate-x-6"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-700">התראות SMS</span>
              <button
                onClick={() => handleNotificationChange("sms")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.sms ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.sms ? "translate-x-1" : "translate-x-6"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-700">התראות Push</span>
              <button
                onClick={() => handleNotificationChange("push")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.push ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.push ? "translate-x-1" : "translate-x-6"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {t('התנתק/י')}
        </button>
      </div>
    </div>
  );
}
