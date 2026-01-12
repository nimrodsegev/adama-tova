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
import UserApprovalCard from "@/lib/components/UI/UserApprovalCard";

export default function ElementsPage() {
  // Filter States
  const [f1, setF1] = useState("all");
  const [f2, setF2] = useState("recommended");
  const [f3, setF3] = useState("pending");
  const [f4, setF4] = useState("all");

  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div
      className="mobile-container"
      style={{ paddingBottom: "120px", minHeight: "100vh", overflowY: "auto" }}
    >
      <style jsx global>{`
        body {
          overflow: auto !important;
          position: static !important;
        }
        .elements-grid {
          display: flex;
          flex-direction: column;
          gap: 40px;
          padding: 20px;
        }
        .section-title {
          font-family: var(--font-primary);
          color: white;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 12px;
          margin-bottom: 20px;
          font-size: 22px;
        }
        .group {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
        }
        .sub-label {
          display: block;
          color: rgba(255, 255, 255, 0.5);
          font-size: 13px;
          margin-bottom: 8px;
          font-family: var(--font-secondary);
        }
        .card-stack {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
      `}</style>

      <div className="vector-background" />

      <div className="main-content">
        <div className="elements-grid">
          {/* --- USER CARDS SECTION --- */}
          <section>
            <h2 className="section-title">User Cards</h2>
            <div className="card-stack">
              <div>
                <span className="sub-label">
                  User Schedule Card (79px height, button on left)
                </span>
                <NewUserScheduleActivityCard
                  id="u1"
                  title="תנועה וצלילים מרפאים"
                  startTime="17:00"
                  endTime="18:30"
                  currentParticipants={8}
                  maxParticipants={10}
                  registrationStatus="registered"
                />
              </div>
              <div>
                <span className="sub-label">
                  User Approval Card (Text Right, multi-line)
                </span>
                <UserApprovalCard userName="ישראל ישראלי" requestDate="01.01" />
              </div>
            </div>
          </section>

          {/* --- ADMIN CARDS SECTION --- */}
          <section>
            <h2 className="section-title">Admin Cards</h2>
            <div className="card-stack">
              <div>
                <span className="sub-label">
                  Standard Activity Card (105px height)
                </span>
                <NewAdminActivityCard
                  id="a1"
                  title="תנועה וצלילים מרפאים"
                  instructor="חגית אזולי"
                  day="יום ה׳"
                  startTime="19:00"
                  currentParticipants={5}
                  maxParticipants={10}
                />
              </div>
              <div>
                <span className="sub-label">
                  Schedule Activity Card (85px height, Start-End)
                </span>
                <NewAdminScheduleActivityCard
                  id="a2"
                  title="פילאטיס בוקר"
                  startTime="08:00"
                  endTime="09:15"
                  currentParticipants={12}
                  maxParticipants={20}
                />
              </div>
            </div>
          </section>

          {/* --- FILTERS SECTION --- */}
          <section>
            <h2 className="section-title">Home Filters (All Sizes)</h2>
            <div className="card-stack">
              <HomeFilter
                size="small"
                options={ALL_UNREAD_OPTIONS}
                activeOption={f1}
                onFilterChange={setF1}
              />
              <HomeFilter
                size="medium"
                options={ADMIN_FILTER_OPTIONS}
                activeOption={f3}
                onFilterChange={setF3}
              />
              <HomeFilter
                size="large"
                options={USER_FILTER_OPTIONS}
                activeOption={f2}
                onFilterChange={setF2}
              />
              <HomeFilter
                size="medium"
                options={AVAILABILITY_OPTIONS}
                activeOption={f4}
                onFilterChange={setF4}
              />
            </div>
          </section>

          {/* --- BUTTONS SECTION --- */}
          <section>
            <h2 className="section-title">Button Gallery</h2>
            <div className="group">
              <Button variant="primary" size="L">
                Primary L
              </Button>
              <Button variant="primary" size="M">
                Primary M
              </Button>
              <Button variant="primary" size="S">
                Primary S
              </Button>
            </div>
            <div className="group" style={{ marginTop: "10px" }}>
              <Button variant="secondary" size="L">
                Secondary L
              </Button>
              <Button variant="secondary" size="M">
                Secondary M
              </Button>
              <Button variant="secondary" size="S">
                Secondary S
              </Button>
            </div>
            <div className="group" style={{ marginTop: "10px" }}>
              <Button variant="whatsapp">הצטרפות לקבוצה</Button>
              <Button variant="waiting-list">הסרה מהמתנה</Button>
              <Button variant="approve">אשר</Button>
              <Button variant="reject">סרב</Button>
            </div>
            <div className="group" style={{ marginTop: "10px" }}>
              <Button variant="popup-primary">סגור</Button>
              <Button variant="popup-secondary">כן, שלח מייל</Button>
            </div>
            <div className="group" style={{ marginTop: "10px" }}>
              <Button variant="tertiary" colorType="white">
                מחק
              </Button>
              <Button variant="tertiary" colorType="orange">
                להרשמה
              </Button>
              <Button variant="tertiary" colorType="delete">
                הכל
              </Button>
            </div>
          </section>

          {/* --- NAVIGATION SECTION --- */}
          <section>
            <h2 className="section-title">Navigation</h2>
            <DaySlider
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
