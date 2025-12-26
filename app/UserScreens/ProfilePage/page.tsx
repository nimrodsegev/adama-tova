"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/contexts/UserContext";
import { apiUser } from "@/app/services/db_api";

// 🏷️ The list of all possible interests in your system
const AVAILABLE_INTERESTS = [
  "מדיטציה", "יוגה",  "אומנות", 
  "כתיבה", "מיינדפולנס", "יצירה",
];

export default function UserProfilePage() {
  const { user, userProfile, loading } = useUser();
  const router = useRouter();

  // State
  const [isEditing, setIsEditing] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Load interests from Profile Context on mount
  useEffect(() => {
    if (userProfile?.quiz?.interests) {
      setSelectedInterests(userProfile.quiz.interests);
    }
  }, [userProfile]);

  // Toggle Selection Logic
  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(prev => prev.filter(i => i !== interest));
    } else {
      setSelectedInterests(prev => [...prev, interest]);
    }
  };

  // Save to DB
  const handleSave = async () => {
    setSaving(true);
    if (!user) return;

    const [_, error] = await apiUser.updateUserInterests(user.id, selectedInterests);

    if (error) {
      alert("שגיאה בעדכון: " + error);
    } else {
      alert("הפרופיל עודכן בהצלחה! ✅");
      setIsEditing(false);
      window.location.reload(); // Refresh to update Context
    }
    setSaving(false);
  };

  if (loading) return <div className="p-10 text-center">טוען פרופיל...</div>;
  if (!userProfile) return <div className="p-10 text-center">לא נמצא משתמש</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">הפרופיל שלי</h1>
          <button onClick={() => router.back()} className="text-blue-600">← חזרה</button>
        </div>

        {/* 👤 CARD 1: PERSONAL INFO (Read Only) */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">פרטים אישיים</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-500">שם מלא: {userProfile.full_name} </label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500">אימייל: {userProfile.email}</label>
              </div>
              <div>
                <label className="block text-sm text-gray-500">טלפון: {userProfile.phone || "לא צוין"}</label>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-500">מעגל: (Circle)</label>
              <div className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold mt-1">
                {userProfile.quiz?.circle || "כללי"}
              </div>
            </div>
          </div>
        </div>

        {/* 🏷️ CARD 2: INTERESTS (Editable) */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="text-xl font-bold text-gray-700">תחומי עניין: </h2>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="text-blue-600 font-bold text-sm hover:underline"
              >
                ✏️ ערוך תחומי עניין
              </button>
            )}
          </div>

          {/* VIEW MODE */}
          {!isEditing ? (
            <div className="flex flex-wrap gap-2">
              {selectedInterests.length > 0 ? (
                selectedInterests.map((tag, idx) => (
                  <span key={idx} className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-full font-medium">
                    {tag + " "}
                  </span>
                ))
              ) : (
                <p className="text-gray-400 italic">לא נבחרו תחומי עניין עדיין.</p>
              )}
            </div>
          ) : (
            /* EDIT MODE */
            <div>
              <p className="text-sm text-gray-500 mb-4">בחר את התחומים שמעניינים אותך כדי שנוכל להמליץ לך על פעילויות מתאימות:</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {AVAILABLE_INTERESTS.map((tag) => {
                  const isSelected = selectedInterests.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleInterest(tag)}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-bold transition-all
                        ${isSelected 
                          ? "bg-blue-600 text-white shadow-md transform scale-105" 
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"}
                      `}
                    >
                      {tag} {isSelected && "✓"}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3 border-t pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold shadow-sm transition-colors flex-1"
                >
                  {saving ? "שומר..." : "שמור שינויים"}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    // Reset selection to original
                    if(userProfile?.quiz?.interests) setSelectedInterests(userProfile.quiz.interests);
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-bold transition-colors"
                >
                  ביטול
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}