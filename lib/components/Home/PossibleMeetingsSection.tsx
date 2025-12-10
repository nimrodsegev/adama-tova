"use client";
import MeetingCard from "./MeetingCard";

type Meeting = {
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
    <section style={{ direction: "ltr", marginTop: "32px" }}>
      <h2>מפגשים אפשריים שאתה יכול להצטרף אליהם</h2>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          marginTop: "16px",
        }}
      >
        {meetings.map((m, index) => (
          <MeetingCard
            key={index}
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
