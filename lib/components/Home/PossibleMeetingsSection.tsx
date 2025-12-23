"use client";
import MeetingCard from "./MeetingCard";

type Meeting = {
  id: string;
  title: string;
  time: string;
  location: string;
  description: string;
};

type PossibleMeetingsSectionProps = {
  meetings: Meeting[];
};

export default function PossibleMeetingsSection({
  meetings,
}: PossibleMeetingsSectionProps) {
  return (
    <section style={{ direction: "rtl", marginTop: "32px" }}>
      <h2 style={{ textAlign: "right" }}>
        מפגשים אפשריים שאתה יכול להצטרף אליהם
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
        {meetings.map((m) => (
          <MeetingCard
            key={m.id}
            id={m.id}
            title={m.title}
            time={m.time}
            location={m.location}
            description={m.description}
          />
        ))}
      </div>
    </section>
  );
}
