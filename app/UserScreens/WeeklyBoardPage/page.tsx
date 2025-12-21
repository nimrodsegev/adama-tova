"use client";
import { useState, useEffect } from "react";
import WeeklyHeader from "@/lib/components/WeeklyBoard/WeeklyHeader";
import DaySlider from "@/lib/components/WeeklyBoard/DaySlider";
import WeekNavigation from "@/lib/components/WeeklyBoard/WeekNavigation";
import MeetingCard from "@/lib/components/Home/MeetingCard";
// 👇 1. Import User Context & Registration API
import { useUser } from "@/app/contexts/UserContext"; 
import { apiActivities, apiRegistrations } from "@/app/services/db_api"; 

export default function WeeklyBoardPage() {
  const { user } = useUser(); // Get current user
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayIndex, setSelectedDayIndex] = useState(new Date().getDay());

  const [activities, setActivities] = useState<any[]>([]);
  // 👇 2. State to track which activities the user has joined
  const [myRegistrationIds, setMyRegistrationIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  // 👇 3. State to show loading spinner on specific buttons
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const getSelectedDateObject = () => {
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay());
    const selected = new Date(weekStart);
    selected.setDate(weekStart.getDate() + selectedDayIndex);
    return selected;
  };

  const selectedDateObj = getSelectedDateObject();

  // --- Fetch Data (Activities + User Registrations) ---
  const fetchData = async () => {
    setLoading(true);

    const year = selectedDateObj.getFullYear();
    const month = String(selectedDateObj.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDateObj.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;

    // A. Fetch Activities
    const [actData, actError] = await apiActivities.getByDate(dateString);
    if (actError) console.error("Error fetching activities:", actError);
    else setActivities(actData || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [selectedDayIndex, currentDate, user]); // Re-run if date changes or user logs in

  // --- Handle Register / Cancel ---
  const handleToggleRegistration = async (activityId: string) => {
    if (!user) return alert("עליך להתחבר כדי להירשם.");
    
    setActionLoading(activityId); // Show loading on this button

    const isRegistered = myRegistrationIds.includes(activityId);

    if (isRegistered) {
      // ❌ CANCEL
      const [_, error] = await apiRegistrations.cancelRegistration(user.id, activityId);
      if (error) alert("שגיאה בביטול: " + error);
      else {
        setMyRegistrationIds(prev => prev.filter(id => id !== activityId));
      }
    } else {
      // ✅ REGISTER
      const [res, error] = await apiRegistrations.registerUserToActivity(user.id, activityId);
      if (error) alert("שגיאה בהרשמה: " + error);
      else {
        setMyRegistrationIds(prev => [...prev, activityId]);
        if (res?.message) alert(res.message);
      }
    }
    setActionLoading(null); // Stop loading
  };

  // --- Navigation Handlers ---
  const handleWeekChange = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + offset * 7);
    setCurrentDate(newDate);
  };

  const dayLetters = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];

  return (
    <main
      style={{
        padding: "20px",
        maxWidth: "1200px",
        margin: "0 auto",
        direction: "rtl",
      }}
    >
      <WeeklyHeader currentDate={selectedDateObj} />
      <WeekNavigation
        currentWeekStart={currentDate}
        onWeekChange={handleWeekChange}
      />
      <DaySlider
        selectedDayIndex={selectedDayIndex}
        onDaySelect={setSelectedDayIndex}
        currentWeekStart={currentDate}
      />

      <section style={{ marginTop: "32px" }}>
        <h2 style={{ marginBottom: "16px", fontSize: "24px" }}>
          מפגשים ליום {dayLetters[selectedDayIndex]} (&apos;
          {selectedDateObj.toLocaleDateString("he-IL")}&apos;)
        </h2>

        {loading ? (
          <p>טוען נתונים מהשרת...</p>
        ) : activities.length > 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            {activities.map((activity) => {
              // Check if user is already registered for this specific card
              const isRegistered = myRegistrationIds.includes(activity.id);
              const isLoadingThis = actionLoading === activity.id;

              return (
                <div key={activity.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <MeetingCard
                    title={activity.title}
                    time={`${activity.start_time} - ${activity.end_time}`}
                    location={activity.category}
                    description={activity.description}
                  />
                  
                  {/* 👇 The Action Button */}
                  <button
                    onClick={() => handleToggleRegistration(activity.id)}
                    disabled={isLoadingThis}
                    style={{
                      padding: "8px",
                      borderRadius: "8px",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: "bold",
                      color: "white",
                      transition: "0.2s",
                      backgroundColor: isRegistered ? "#ff4d4f" : "#28a745", // Red for cancel, Green for join
                      opacity: isLoadingThis ? 0.7 : 1
                    }}
                  >
                    {isLoadingThis 
                      ? "מעדכן..." 
                      : isRegistered 
                        ? "בטל הרשמה ✕" 
                        : "הירשם לפעילות ✓"}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ color: "#888", fontSize: "18px" }}>
            אין סדנאות רשומות ליום זה.
          </p>
        )}
      </section>
    </main>
  );
}