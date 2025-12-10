import HomeHeader from "@/lib/components/Home/HomeHeader";
import MeetingSection from "@/lib/components/Home/MeetingSection";
import PossibleMeetingsSection from "@/lib/components/Home/PossibleMeetingsSection";

export default function HomePage() {
  const upcomingMeetings = [
    {
      title: "עמידה של הצוות",
      time: "10:00 בבוקר",
      location: "חדר 301",
      description: "סנכרון יומי של הצוות",
    },
    {
      title: "סקירת עיצוב",
      time: "14:00 אחר הצהריים",
      location: "זום",
      description: "סקירה של מוקאפים חדשים",
    },
  ];

  const possibleMeetings = [
    {
      title: "שיחת קפה",
      time: "15:00 אחר הצהריים",
      location: "בית קפה",
      description: "הזדמנות לנטוורקינג",
    },
    {
      title: "סדנה",
      time: "16:00 אחר הצהריים",
      location: "מעבדה 2",
      description: "למידת כלים חדשים",
    },
  ];

  return (
    <main style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <HomeHeader userName="נדב" />
      <MeetingSection meetings={upcomingMeetings} />
      <PossibleMeetingsSection meetings={possibleMeetings} />
    </main>
  );
}
