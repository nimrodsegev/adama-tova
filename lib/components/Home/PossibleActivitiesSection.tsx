"use client";
import UserActivityCard from "./UserActivityCard";

type Activity = {
  id: string;
  title: string;
  date: string;
  start_time: string;
  location: string;
  description: string;
};

type PossibleActivitiesSectionProps = {
  activities: Activity[];
};

export default function PossibleActivitiesSection({
  activities,
}: PossibleActivitiesSectionProps) {
  return (
    <section style={{ direction: "rtl", marginTop: "32px" }}>
      <h2 style={{ textAlign: "right" }}>
        פעילויות אפשריות שאתה יכול להצטרף אליהן
      </h2>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          marginTop: "16px",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        {activities.map((activity) => (
          <UserActivityCard
            key={activity.id}
            id={activity.id}
            title={activity.title}
            date={activity.date}
            start_time={activity.start_time}
            location={activity.location}
            description={activity.description}
          />
        ))}
      </div>
    </section>
  );
}
