"use client";

import React, { useState } from "react";
import {
  HomeFilter,
  ALL_UNREAD_OPTIONS,
  USER_FILTER_OPTIONS,
  ADMIN_FILTER_OPTIONS,
  ADMIN_STATUS_OPTIONS,
  AVAILABILITY_OPTIONS,
} from "@/lib/components/UI/HomeFilter";
import DaySlider from "@/lib/components/UI/DaySlider";

import Button from "@/lib/components/UI/Button";

/**
 * UI Elements Showcase Page
 * Shows all UI components - scrollable override for viewing all elements
 */
export default function ElementsPage() {
  // HomeFilter states
  const [filter1, setFilter1] = useState("all");
  const [filter2, setFilter2] = useState("recommended");
  const [filter3, setFilter3] = useState("pending");
  const [filter4, setFilter4] = useState("all");
  const [filter5, setFilter5] = useState("all");

  // DaySlider state
  const [selectedDate, setSelectedDate] = useState(new Date());

  // ReadSort state
  const [readFilter, setReadFilter] = useState<"all" | "unread" | "read">(
    "all"
  );

  return (
    <>
      {/* Override global non-scrollable styles for this page only */}
      <style jsx global>{`
        body {
          overflow: auto !important;
          position: static !important;
          height: auto !important;
        }
        #__next {
          overflow: auto !important;
        }
      `}</style>

      <div
        className="mobile-container"
        style={{ paddingBottom: "100px", minHeight: "100vh" }}
      >
        <div className="vector-background" />

        {/* Page Header */}
        <div className="absolute-header">
          <h1 className="header-primary">UI Elements</h1>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* --- BUTTONS SECTION --- */}
          <section className="section">
            <h2 className="text-section-title">Primary Buttons (Purple)</h2>
            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <Button variant="primary" size="L">
                Large
              </Button>
              <Button variant="primary" size="M">
                Medium
              </Button>
              <Button variant="primary" size="S">
                Small
              </Button>
            </div>
          </section>

          <section className="section">
            <h2 className="text-section-title">Secondary Buttons (Stroke)</h2>
            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <Button variant="secondary" size="L">
                Large
              </Button>
              <Button variant="secondary" size="M">
                Medium
              </Button>
              <Button variant="secondary" size="S">
                Small
              </Button>
            </div>
          </section>

          <section className="section">
            <h2 className="text-section-title">Tertiary Buttons (Icons)</h2>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              <Button variant="tertiary" colorType="orange">
                להרשמה (Orange)
              </Button>
              <Button variant="tertiary" colorType="delete">
                מחק (Red)
              </Button>
              <Button variant="tertiary" colorType="white">
                הכל (White)
              </Button>
            </div>
          </section>

          <section className="section">
            <h2 className="text-section-title">Action Buttons (Approve/Reject)</h2>
            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <Button variant="approve">אשר</Button>
              <Button variant="reject">סרב</Button>
            </div>
          </section>

          <hr
            style={{
              border: "0.5px solid rgba(255,255,255,0.2)",
              margin: "20px 0",
            }}
          />

          {/* --- DAY SLIDER SECTION --- */}
          <section className="section">
            <h2 className="text-section-title">DaySlider (Weekly)</h2>
            <DaySlider
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
            <div className="glass-card-auto mt-md">
              <p className="text-body">
                Selected Date: {selectedDate.toLocaleDateString("he-IL")}
              </p>
            </div>
          </section>

          <hr
            style={{
              border: "0.5px solid rgba(255,255,255,0.2)",
              margin: "20px 0",
            }}
          />

          {/* --- HOME FILTERS SECTION --- */}
          <section className="section">
            <h2 className="text-section-title">HomeFilter Variants</h2>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <div>
                <p className="text-small mb-xs">Small - All/Unread</p>
                <HomeFilter
                  size="small"
                  options={ALL_UNREAD_OPTIONS}
                  activeOption={filter1}
                  onFilterChange={setFilter1}
                />
              </div>

              <div>
                <p className="text-small mb-xs">Large - User Options</p>
                <HomeFilter
                  size="large"
                  options={USER_FILTER_OPTIONS}
                  activeOption={filter2}
                  onFilterChange={setFilter2}
                />
              </div>

              <div>
                <p className="text-small mb-xs">Medium - Admin Filters</p>
                <HomeFilter
                  size="medium"
                  options={ADMIN_FILTER_OPTIONS}
                  activeOption={filter3}
                  onFilterChange={setFilter3}
                />
              </div>

              <div>
                <p className="text-small mb-xs">Medium - Admin Status</p>
                <HomeFilter
                  size="medium"
                  options={ADMIN_STATUS_OPTIONS}
                  activeOption={filter4}
                  onFilterChange={setFilter4}
                />
              </div>

              <div>
                <p className="text-small mb-xs">Medium - Availability</p>
                <HomeFilter
                  size="medium"
                  options={AVAILABILITY_OPTIONS}
                  activeOption={filter5}
                  onFilterChange={setFilter5}
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
