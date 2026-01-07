"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiUser } from "@/app/services/db_api"; // Ensure you export getById or similar

export default function UserQuizPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get("id");
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) loadUser();
  });

  const loadUser = async () => {
    // We can reuse getAllUsers and find, or add a specific getById in apiUser
    // For simplicity, let's assume we filter from the main list or add a helper.
    // Ideally, add getById to apiUser. Here is a quick inline fetch logic using supabase directly 
    // or reusing a specific API function if you have one. 
    // Let's assume you add `getUserById` to apiUser (code below).
    const [data, error] = await apiUser.getProfile(userId!); 
    if (data) setUser(data);
    setLoading(false);
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!user) return <div className="p-10 text-center">User not found</div>;

  const quiz = user.quiz || {};

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <button onClick={() => router.back()} className="mb-4 text-blue-600">← חזרה לניהול משתמשים</button>
        
        <h1 className="text-2xl font-bold mb-6">שאלון משתמש: {user.full_name}</h1>
        
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-bold text-blue-800 mb-2">🏷️ תחומי עניין (Interests)</h3>
            <div className="flex flex-wrap gap-2">
              {quiz.interests?.map((tag: string, i: number) => (
                <span key={i} className="bg-white border border-blue-200 px-3 py-1 rounded-full text-sm">
                  {tag + " "}
                </span>
              )) || "לא צוינו תחומי עניין"}
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-bold text-purple-800 mb-2">⭕ מעגל שייכות (Circle)</h3>
            <p className="text-lg">{quiz.circle || "לא צוין"}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-bold text-gray-800 mb-2">📝 טקסט חופשי / הערות</h3>
            <p className="whitespace-pre-wrap">{quiz.free_text || "אין הערות"}</p>
          </div>

          <div className="text-sm text-gray-400 mt-8 pt-4 border-t">
            השאלון הושלם בתאריך: {quiz.completed_at ? new Date(quiz.completed_at).toLocaleDateString() : "לא ידוע"}
          </div>
        </div>
      </div>
    </div>
  );
}