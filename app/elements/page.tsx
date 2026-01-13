"use client";

import React, { useState } from "react";
import {
  HomeFilter,
  ALL_UNREAD_OPTIONS,
  USER_FILTER_OPTIONS,
  ADMIN_FILTER_OPTIONS,
  AVAILABILITY_OPTIONS,
} from "@/lib/components/UI/HomeFilter";
import DaySlider from "@/lib/components/UI/DaySlider";
import Button from "@/lib/components/UI/Button";
import NewAdminActivityCard from "@/lib/components/UI/NewAdminActivityCard";
import NewAdminScheduleActivityCard from "@/lib/components/UI/NewAdminScheduleActivityCard";
import NewUserScheduleActivityCard from "@/lib/components/UI/NewUserScheduleActivityCard";
import NewUserActivityCard from "@/lib/components/UI/NewUserActivityCard";
import UserApprovalCard from "@/lib/components/UI/UserApprovalCard";
import OpenHours from "@/lib/components/UI/OpenHours";
import EmptyState from "@/lib/components/UI/EmptyState";

export default function ElementsPage() {
  // Filter States
  const [f1, setF1] = useState("all");
  const [f2, setF2] = useState("recommended");
  const [f3, setF3] = useState("pending");
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div className="mobile-container">
      {/* Background decoration from global CSS */}
      <div className="vector-background" />

      {/* Main scrollable content area */}
      <div className="main-content-high">
        {/* --- STATUS & INFO --- */}
        <section className="section">
          <h2 className="text-section-title">סטטוס ומידע</h2>
          <OpenHours startTime="16:00" endTime="22:00" />
        </section>

        {/* --- EMPTY STATES SECTION --- */}
        <section className="section">
          <h2 className="text-section-title">מצבי ריק (Empty States)</h2>
          <div className="vertical-scroll gap-lg">
            <div>
              <p className="text-small mb-xs" style={{ opacity: 0.6 }}>
                הוספת פעילות (מנהל)
              </p>
              <EmptyState
                message="עדיין לא נוספו פעילויות להיום"
                buttonText="להוספת פעילות"
                buttonHref="/AdminScreens/AddActivity"
              />
            </div>

            <div>
              <p className="text-small mb-xs" style={{ opacity: 0.6 }}>
                הוספת הודעה (מנהל)
              </p>
              <EmptyState
                message="אין הודעות חדשות במערכת"
                buttonText="להוספת הודעה"
                onButtonClick={() => alert("פתיחת מודל הודעה")}
              />
            </div>
          </div>
        </section>

        {/* --- USER CARDS SECTION --- */}
        <section className="section">
          <h2 className="text-section-title">רכיבי משתמש</h2>
          <div className="vertical-scroll gap-md">
            <UserApprovalCard userName="ישראל ישראלי" requestDate="01.01" />
          </div>
        </section>

        {/* --- ADMIN CARDS SECTION --- */}
        <section className="section">
          <h2 className="text-section-title">רכיבי מנהל</h2>
          <div className="vertical-scroll gap-md">
            <NewAdminActivityCard
              id="a_act_1"
              title="תנועה וצלילים מרפאים"
              instructor="חגית אזולי"
              day="יום ה׳"
              startTime="19:00"
              currentParticipants={5}
              maxParticipants={10}
            />
            <NewAdminScheduleActivityCard
              id="a_sch_1"
              title="פילאטיס בוקר"
              startTime="08:00"
              endTime="09:15"
              currentParticipants={12}
              maxParticipants={20}
            />
          </div>
        </section>

        {/* --- BUTTONS SECTION --- */}
        <section className="section">
          <h2 className="text-section-title">כפתורים</h2>
          <div className="group gap-md">
            <Button variant="primary" size="L">
              כפתור L
            </Button>
            <Button variant="whatsapp">WhatsApp</Button>
            <Button variant="tertiary" colorType="orange">
              להרשמה ›
            </Button>
          </div>
          <div className="group gap-md mt-sm">
            <Button variant="approve">אשר</Button>
            <Button variant="reject">סרב</Button>
            <Button variant="waiting-list">הסרה מהמתנה</Button>
          </div>
        </section>

        {/* --- FILTERS & NAVIGATION --- */}
        <section className="section mb-5xl">
          <h2 className="text-section-title">פילטרים וניווט</h2>
          <DaySlider
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
          <div className="mt-md">
            <HomeFilter
              size="large"
              options={USER_FILTER_OPTIONS}
              activeOption={f2}
              onFilterChange={setF2}
            />
          </div>
          <div className="mt-md">
            <HomeFilter
              size="small"
              options={ALL_UNREAD_OPTIONS}
              activeOption={f1}
              onFilterChange={setF1}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
