"use client";
import MeetingCard from "./MeetingCard";

type Meeting = {
  id: string;
  title: string;
  time: string;
  location: string;
  description: string;
};

type MeetingsSectionProps = {
  meetings: Meeting[];
};

export default function MeetingSection({ meetings }: MeetingsSectionProps) {
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
        {meetings.map((m, index) => (
          <MeetingCard
            id={m.id}
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
