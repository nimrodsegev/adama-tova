"use client";
import UserActivityCard from "./UserActivityCard";

type Activity = {
  id: string;
  title: string;
  start_time: string; // ✅ Changed from time to start_time
  location: string;
  description: string;
  date: string;
};

type ActivitySectionProps = {
  activities: Activity[];
};

export default function ActivitySection({ activities }: ActivitySectionProps) {
  return (
    <section style={{ direction: "rtl", marginTop: "32px" }}>
      <h2 style={{ textAlign: "right" }}>המפגשים הבאים שלך</h2>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-start",
          marginTop: "16px",
        }}
      >
        {activities.map((m, index) => (
          <UserActivityCard
            id={m.id}
            key={index}
            title={m.title}
            date={m.date}
            start_time={m.start_time} // ✅ Now correctly passed
            location={m.location}
            description={m.description}
          />
        ))}
      </div>
    </section>
  );
}
