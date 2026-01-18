"use client";
import { useState, useRef, useMemo, useLayoutEffect, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { apiActivities } from "@/app/services/db_api";
import { useIvrita } from "@/app/contexts/IvritaContext";
import styles from "./AddActivityPage.module.css";
import SmoothPageWrapper from "@/lib/components/UI/SmoothPageWrapper";
import CutInput from "@/lib/components/UI/CutInput";
import UnifiedDropdown from "@/lib/components/UI/UnifiedDropdown";
import Popup from "@/lib/components/UI/Popup";

// --- Types ---
type ActivityStatus = "open" | "closed" | "cancelled";
type ActivityCategory =
  | "mindfulness"
  | "body_motion"
  | "music_sound"
  | "creation_material";
type ActivityBranch = "satria" | "nahalal";
type GroupCircles =
  | "Nova Survivor"
  | "October 7 victim"
  | "Shkulim parents"
  | "Shkulim Siblings"
  | "Family of october 7 victim"
  | "Rescue forces"
  | "Residence of Otef Aza"
  | "Second or third";

// --- Options ---
const BRANCH_OPTIONS = [
  { value: "satria", label: "סניף סתריה" },
  { value: "nahalal", label: "סניף נהלל" },
];
const TYPE_OPTIONS = [
  { value: "workshop", label: "סדנה" },
  { value: "group", label: "קבוצה" },
];
const CATEGORY_OPTIONS = [
  { value: "mindfulness", label: "מיינדפולנס" },
  { value: "body_motion", label: "גוף ותנועה" },
  { value: "music_sound", label: "מוזיקה" },
  { value: "creation_material", label: "יצירה וחומר" },
];
const CIRCLE_OPTIONS = [
  "Nova Survivor",
  "October 7 victim",
  "Shkulim parents",
  "Shkulim Siblings",
  "Family of october 7 victim",
  "Rescue forces",
  "Residence of Otef Aza",
  "Second or third",
];
const CIRCLE_LABELS: Record<string, string> = {
  "Nova Survivor": "שורדי מסיבות",
  "October 7 victim": "נפגעי טראומה 7.10 ומלחמת חרבות ברזל",
  "Shkulim parents": "הורים שכולים",
  "Shkulim Siblings": "אחים.ות שכולים",
  "Family of october 7 victim": "קרובים של נפגעי טראומה בגופם ובנפשם",
  "Rescue forces": "כוחות הצלה וחילוץ",
  "Residence of Otef Aza": "תושבי העוטף ומפונים",
  "Second or third": "מעגל שני ושלישי של משפחות השכול",
};

// --- Date Helpers ---
const DAYS = Array.from({ length: 31 }, (_, i) =>
  (i + 1).toString().padStart(2, "0")
);
const MONTHS = Array.from({ length: 12 }, (_, i) =>
  (i + 1).toString().padStart(2, "0")
);
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 3 }, (_, i) =>
  (CURRENT_YEAR + i).toString()
);

// --- CUSTOM SVG ARROW ---
const CustomArrowIcon = ({
  className,
  rotation = 0,
}: {
  className?: string;
  rotation?: number;
}) => (
  <svg
    width="24"
    height="14"
    viewBox="0 0 24 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ transform: `rotate(${rotation}deg)` }}
  >
    <path
      d="M2 2L12 12L22 2"
      stroke="white"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
// The Horizontal Arrow for the "Swipe Hint"
const NextArrow = () => (
  <svg
    width="20"
    height="18"
    viewBox="0 0 20 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1 8.99609L18.9998 8.98543"
      stroke="white"
      strokeWidth="2"
      strokeMiterlimit="10"
      strokeLinecap="round"
    />
    <path
      d="M7.225 2L1 8.975"
      stroke="white"
      strokeWidth="2"
      strokeMiterlimit="10"
      strokeLinecap="round"
    />
    <path
      d="M0.99961 9L7.22461 15.975"
      stroke="white"
      strokeWidth="2"
      strokeMiterlimit="10"
      strokeLinecap="round"
    />
  </svg>
);

// --- Custom Time Picker Component ---
const TimePicker = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) => {
  const [hourStr, minStr] = value ? value.split(":") : ["12", "00"];
  const hour = parseInt(hourStr || "12");
  const minute = parseInt(minStr || "00");

  const updateTime = (newH: number, newM: number) => {
    const hStr = newH.toString().padStart(2, "0");
    const mStr = newM.toString().padStart(2, "0");
    onChange(`${hStr}:${mStr}`);
  };

  const incrementHour = () => updateTime((hour + 1) % 24, minute);
  const decrementHour = () => updateTime((hour - 1 + 24) % 24, minute);

  const incrementMinute = () => updateTime(hour, (minute + 5) % 60);
  const decrementMinute = () => updateTime(hour, (minute - 5 + 60) % 60);

  return (
    <div className={styles.timePickerContainer}>
      <div className={styles.timeColumn}>
        <button
          type="button"
          onClick={incrementHour}
          className={styles.timeButton}
        >
          <CustomArrowIcon rotation={180} />
        </button>
        <span className={styles.timeValue}>
          {hour.toString().padStart(2, "0")}
        </span>
        <button
          type="button"
          onClick={decrementHour}
          className={styles.timeButton}
        >
          <CustomArrowIcon rotation={0} />
        </button>
      </div>
      <div className={styles.timeColumn}>
        <button
          type="button"
          onClick={incrementMinute}
          className={styles.timeButton}
        >
          <CustomArrowIcon rotation={180} />
        </button>
        <span className={styles.timeValue}>
          {minute.toString().padStart(2, "0")}
        </span>
        <button
          type="button"
          onClick={decrementMinute}
          className={styles.timeButton}
        >
          <CustomArrowIcon rotation={0} />
        </button>
      </div>
    </div>
  );
};

// --- Helper for Progress Icons ---
const getProgressCircleIcon = (stepIndex: number, isCurrent: boolean) => {
  const suffix = isCurrent ? "_filled" : "";
  return `/icons/progress_circle_${stepIndex + 1}${suffix}.svg`;
};

export default function AddActivityPage() {
  const router = useRouter();
  const { t } = useIvrita();

  const [mounting, setMounting] = useState(true);
  const [closing, setClosing] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  // --- POPUP STATE ---
  const [showPopup, setShowPopup] = useState(false);
  const [popupConfig, setPopupConfig] = useState({ title: "", content: "" });

  // Arrow State
  const [arrowVisible, setArrowVisible] = useState(false);
  const arrowTimerRef = useRef<NodeJS.Timeout | null>(null);

  // --- SWIPE VALIDATION STATE ---
  const [titleError, setTitleError] = useState("");
  const [branchError, setBranchError] = useState("");
  const [instructorError, setInstructorError] = useState("");
  const [maxParticipantsError, setMaxParticipantsError] = useState("");

  // Touch tracking refs
  const touchStartX = useRef<number | null>(null);
  const touchStartScrollLeft = useRef<number | null>(null);

  // Dropdown States
  const [isBranchOpen, setIsBranchOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isCircleOpen, setIsCircleOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isDayOpen, setIsDayOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    branch: "" as ActivityBranch | "",
    location: "",
    instructor: "",
    max_participants: "",
    description: "",
    type: "workshop",
    day: "",
    month: "",
    year: "",
    startTime: "12:00",
    category: "" as ActivityCategory | "",
    circle: "" as GroupCircles | "",
    weeks: "",
    whatsapp_group_url: "",
    status: "open" as ActivityStatus,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const handleCloseWithAnimation = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      router.back();
    }, 400);
  };

  const isStep1Valid = useMemo(() => {
    return (
      formData.title.trim() !== "" &&
      formData.branch !== "" &&
      formData.instructor.trim() !== "" &&
      formData.max_participants.trim() !== ""
    );
  }, [
    formData.title,
    formData.branch,
    formData.instructor,
    formData.max_participants,
  ]);

  const isStep2Valid = useMemo(() => {
    const baseDateValid =
      formData.day && formData.month && formData.year && formData.startTime;
    if (!baseDateValid) return false;
    if (formData.type === "workshop") return !!formData.category;
    if (formData.type === "group") return !!formData.circle;
    return true;
  }, [formData]);

  const isFormValid = isStep1Valid && isStep2Valid;
  const isScrollLocked = currentStep === 0 && !isStep1Valid;

  const setFormValue = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // --- SWIPE VALIDATION LOGIC ---
  const validateStep1 = () => {
    let isValid = true;

    if (!formData.title.trim()) {
      setTitleError("שדה חובה");
      isValid = false;
    }
    if (!formData.branch) {
      setBranchError("שדה חובה");
      isValid = false;
    }
    if (!formData.instructor.trim()) {
      setInstructorError("שדה חובה");
      isValid = false;
    }
    if (!formData.max_participants.trim()) {
      setMaxParticipantsError("שדה חובה");
      isValid = false;
    }
    return isValid;
  };

  // --- TOUCH HANDLERS ---
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    if (scrollContainerRef.current) {
      touchStartScrollLeft.current = scrollContainerRef.current.scrollLeft;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartScrollLeft.current === null)
      return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const slideWidth = container.offsetWidth;
    const startStep = Math.round(touchStartScrollLeft.current / slideWidth);

    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX.current;

    // Check for swipe "Next" (Right in RTL context means dragging left->right visually, diff > 0)
    if (startStep === 0) {
      if (Math.abs(diff) > 50) {
        if (!isStep1Valid) {
          validateStep1();
        }
      }
    }

    touchStartX.current = null;
    touchStartScrollLeft.current = null;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const slideWidth = container.offsetWidth;
      const scrollPos = Math.abs(container.scrollLeft);
      const step = Math.round(scrollPos / slideWidth);
      if (step !== currentStep && step >= 0 && step <= 2) {
        setCurrentStep(step);
      }
    }
  };

  // --- ARROW LOGIC ---
  useEffect(() => {
    if (arrowTimerRef.current) clearTimeout(arrowTimerRef.current);

    setArrowVisible(false);

    let isCurrentStepValid = false;
    if (currentStep === 0) isCurrentStepValid = isStep1Valid;
    else if (currentStep === 1) isCurrentStepValid = isStep2Valid;
    else return;

    if (isCurrentStepValid) {
      arrowTimerRef.current = setTimeout(() => {
        setArrowVisible(true);
      }, 200);
    }

    return () => {
      if (arrowTimerRef.current) clearTimeout(arrowTimerRef.current);
    };
  }, [currentStep, isStep1Valid, isStep2Valid]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounting(false);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  useLayoutEffect(() => {
    const updateLabelBackgrounds = () => {
      const vh = window.innerHeight;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
      const labels = document.querySelectorAll(
        `.${styles.inputLabel}, .${styles.uploadSubtext}, .${styles.fieldError}`
      ) as NodeListOf<HTMLElement>;
      labels.forEach((el) => {
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--bg-y", `${-rect.top}px`);
      });
    };
    updateLabelBackgrounds();
    const raf = requestAnimationFrame(updateLabelBackgrounds);
    window.addEventListener("resize", updateLabelBackgrounds);

    const slides = document.querySelectorAll(`.${styles.scrollSnapSlide}`);
    slides.forEach((slide) =>
      slide.addEventListener("scroll", updateLabelBackgrounds, {
        passive: true,
      })
    );

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", updateLabelBackgrounds);
      slides.forEach((slide) =>
        slide.removeEventListener("scroll", updateLabelBackgrounds)
      );
    };
  }, [titleError, branchError, instructorError, maxParticipantsError]);

  const handleSubmit = async () => {
    if (!isFormValid) return;
    setSubmitStatus("idle");
    setErrorMessage("");
    setUploading(true);

    const maxPart = parseInt(formData.max_participants);

    if (isNaN(maxPart) || maxPart < 1) {
      setPopupConfig({
        title: "מספר משתתפים לא תקין",
        content: "מספר המשתתפים חייב להיות לפחות 1",
      });
      setShowPopup(true);
      setUploading(false);
      return;
    }

    const activityDate = new Date(
      parseInt(formData.year),
      parseInt(formData.month) - 1,
      parseInt(formData.day),
      parseInt(formData.startTime.split(":")[0]),
      parseInt(formData.startTime.split(":")[1])
    );

    const now = new Date();

    if (activityDate <= now) {
      setPopupConfig({
        title: "תאריך לא תקין",
        content: "לא ניתן ליצור פעילות בתאריך או שעה שכבר עברו",
      });
      setShowPopup(true);
      setUploading(false);
      return;
    }

    const fullDate = `${formData.year}-${formData.month}-${formData.day}`;
    let endTime = "";
    if (formData.startTime) {
      const [h, m] = formData.startTime.split(":").map(Number);
      const endH = (h + 1) % 24;
      endTime = `${endH.toString().padStart(2, "0")}:${m
        .toString()
        .padStart(2, "0")}`;
    }

    let imageUrl = null;
    if (imageFile) {
      const [url, error] = await apiActivities.uploadImage(imageFile);
      if (error) {
        setErrorMessage("שגיאה בהעלאת התמונה");
        setUploading(false);
        return;
      }
      imageUrl = url;
    }

    const isGroup = formData.type === "group";
    const activityObject = {
      title: formData.title,
      description: formData.description,
      branch: formData.branch,
      location: formData.location || "לא צוין",
      instructor: formData.instructor,
      max_participants: maxPart,
      image_url: imageUrl,
      date: fullDate,
      start_time: formData.startTime,
      end_time: endTime,
      status: formData.status,
      is_group: isGroup,
      weeks: isGroup ? parseInt(formData.weeks) || 1 : 1,
      requires_approval: isGroup,
      circle: isGroup ? formData.circle : null,
      category: isGroup ? null : formData.category,
      whatsapp_group_url: formData.whatsapp_group_url,
    };

    const [data, error] = await apiActivities.createActivity(activityObject);

    if (error) {
      setErrorMessage(error);
      setSubmitStatus("error");
    } else {
      setSubmitStatus("success");
      setTimeout(() => router.back(), 1500);
    }
    setUploading(false);
  };

  return (
    <SmoothPageWrapper isLoading={mounting || closing}>
      <main className={`mobile-container ${styles.pageOverride}`}>
        {/* CLOSE BUTTON - Flex item aligned to end */}
        <button
          className={styles.closeButton}
          onClick={handleCloseWithAnimation}
          aria-label="סגור"
        >
          <Image
            src="/icons/close.svg"
            alt="Close icon"
            width={40}
            height={40}
          />
        </button>

        {/* HEADER - Margin top handles spacing */}
        <div className={styles.header}>
          <h1
            className="header-primary"
            style={{ color: "var(--color-text-primary)" }}
          >
            הוספת פעילות
          </h1>
        </div>

        <div
          ref={scrollContainerRef}
          className={`${styles.scrollSnapContainer} ${
            isScrollLocked ? styles.scrollLocked : ""
          }`}
          onScroll={handleScroll}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* STEP 1 */}
          <div className={styles.scrollSnapSlide}>
            <button
              className={`${styles.nextArrow} ${
                arrowVisible && currentStep === 0
                  ? styles.nextArrowSwipeHint
                  : styles.nextArrowHidden
              }`}
              type="button"
              aria-label="המשך"
            >
              <NextArrow />
            </button>
            <div className={styles.slideContent}>
              <CutInput
                label="שם הפעילות"
                value={formData.title}
                onChange={(e) => {
                  setFormValue("title", e.target.value);
                  setTitleError("");
                }}
                className={styles.cutInput}
                type="text"
                dir="rtl"
                textAlign="right"
                error={titleError}
                onErrorExpire={() => setTitleError("")}
              />
              <UnifiedDropdown
                label={"סניף"}
                placeholder="בחר/י סניף"
                options={BRANCH_OPTIONS.map((opt) => ({
                  value: opt.value,
                  label: opt.label,
                }))}
                value={formData.branch}
                onChange={(value) => {
                  setFormValue("branch", value);
                  setBranchError("");
                }}
                isOpen={isBranchOpen}
                onToggle={() => setIsBranchOpen(!isBranchOpen)}
                error={branchError}
                onErrorExpire={() => setBranchError("")}
              />
              <CutInput
                label="מיקום"
                value={formData.location}
                onChange={(e) => setFormValue("location", e.target.value)}
                className={styles.cutInput}
                type="text"
                dir="rtl"
                textAlign="right"
              />
              <CutInput
                label="מנחה"
                value={formData.instructor}
                onChange={(e) => {
                  setFormValue("instructor", e.target.value);
                  setInstructorError("");
                }}
                className={styles.cutInput}
                type="text"
                dir="rtl"
                textAlign="right"
                error={instructorError}
                onErrorExpire={() => setInstructorError("")}
              />
              <CutInput
                label="מספר משתתפים"
                value={formData.max_participants}
                onChange={(e) => {
                  setFormValue("max_participants", e.target.value);
                  setMaxParticipantsError("");
                }}
                className={styles.cutInput}
                type="number"
                dir="rtl"
                textAlign="right"
                error={maxParticipantsError}
                onErrorExpire={() => setMaxParticipantsError("")}
              />

              <div className={styles.uploadWrapper}>
                <input
                  type="file"
                  id="imageUpload"
                  accept="image/*"
                  onChange={handleImageChange}
                  hidden
                />
                <label htmlFor="imageUpload" className={styles.uploadBox}>
                  <div className={styles.paperclipWrapper}>
                    <svg
                      className={styles.paperclipIcon}
                      width="16"
                      height="17"
                      viewBox="0 0 16 17"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M14.8131 7.87167L7.92063 14.7642C7.07624 15.6086 5.93102 16.0829 4.73688 16.0829C3.54274 16.0829 2.39751 15.6086 1.55313 14.7642C0.708744 13.9198 0.234375 12.7746 0.234375 11.5804C0.234375 10.3863 0.708744 9.24105 1.55313 8.39667L8.44563 1.50417C9.00855 0.941246 9.77204 0.625 10.5681 0.625C11.3642 0.625 12.1277 0.941246 12.6906 1.50417C13.2536 2.06709 13.5698 2.83058 13.5698 3.62667C13.5698 4.42276 13.2536 5.18625 12.6906 5.74917L5.79063 12.6417C5.50917 12.9231 5.12742 13.0813 4.72938 13.0813C4.33133 13.0813 3.94959 12.9231 3.66813 12.6417C3.38667 12.3602 3.22854 11.9785 3.22854 11.5804C3.22854 11.1824 3.38667 10.8006 3.66813 10.5192L10.0356 4.15917"
                        stroke="#F9F9F9"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className={styles.uploadText}>
                    {imageFile
                      ? imageFile.name
                      : "לחץ/י כאן על מנת לבחור תמונה"}
                  </span>
                  <span className={styles.uploadSubtext}>
                    תמונה <span className={styles.optionalText}>*לא חובה</span>
                  </span>
                </label>
              </div>
              <CutInput
                label="תיאור"
                value={formData.description}
                onChange={(e) => setFormValue("description", e.target.value)}
                className={styles.cutInput}
                type="text"
                dir="rtl"
                textAlign="right"
              />
            </div>
          </div>

          {/* STEP 2 */}
          <div className={styles.scrollSnapSlide}>
            <button
              className={`${styles.nextArrow} ${
                arrowVisible && currentStep === 1
                  ? styles.nextArrowSwipeHint
                  : styles.nextArrowHidden
              }`}
              type="button"
              aria-label="המשך"
            >
              <NextArrow />
            </button>
            <div className={styles.slideContent}>
              <UnifiedDropdown
                label="סוג פעילות"
                placeholder="בחר/י"
                options={TYPE_OPTIONS.map((opt) => ({
                  value: opt.value,
                  label: opt.label,
                }))}
                value={formData.type}
                onChange={(value) => setFormValue("type", value)}
                isOpen={isTypeOpen}
                onToggle={() => setIsTypeOpen(!isTypeOpen)}
              />
              {formData.type === "workshop" && (
                <UnifiedDropdown
                  label="תחום עניין"
                  placeholder="בחר/י"
                  options={CATEGORY_OPTIONS.map((opt) => ({
                    value: opt.value,
                    label: opt.label,
                  }))}
                  value={formData.category}
                  onChange={(value) => setFormValue("category", value)}
                  isOpen={isCategoryOpen}
                  onToggle={() => setIsCategoryOpen(!isCategoryOpen)}
                />
              )}
              {formData.type === "group" && (
                <>
                  <UnifiedDropdown
                    label="קבוצת יעד"
                    placeholder="בחר/י"
                    options={CIRCLE_OPTIONS.map((opt) => ({
                      value: opt,
                      label: CIRCLE_LABELS[opt],
                    }))}
                    value={formData.circle}
                    onChange={(value) => setFormValue("circle", value)}
                    isOpen={isCircleOpen}
                    onToggle={() => setIsCircleOpen(!isCircleOpen)}
                  />
                  <CutInput
                    label="מספר מפגשים"
                    value={formData.weeks}
                    onChange={(e) => setFormValue("weeks", e.target.value)}
                    className={styles.cutInput}
                    type="text"
                    dir="rtl"
                    textAlign="right"
                  />
                </>
              )}

              <div className={styles.fieldGroup}>
                <div className={styles.dateLabel}>
                  {formData.type === "group" ? "תאריך התחלה" : "תאריך"}
                </div>
                <div className={styles.dateRow}>
                  <UnifiedDropdown
                    label="שנה"
                    placeholder="שנה"
                    options={YEARS.map((y) => ({ value: y, label: y }))}
                    value={formData.year}
                    onChange={(value) => setFormValue("year", value)}
                    isOpen={isYearOpen}
                    onToggle={() => setIsYearOpen(!isYearOpen)}
                    isMini={true}
                  />
                  <UnifiedDropdown
                    label="חודש"
                    placeholder="חודש"
                    options={MONTHS.map((m) => ({ value: m, label: m }))}
                    value={formData.month}
                    onChange={(value) => setFormValue("month", value)}
                    isOpen={isMonthOpen}
                    onToggle={() => setIsMonthOpen(!isMonthOpen)}
                    isMini={true}
                  />
                  <UnifiedDropdown
                    label="יום"
                    placeholder="יום"
                    options={DAYS.map((d) => ({ value: d, label: d }))}
                    value={formData.day}
                    onChange={(value) => setFormValue("day", value)}
                    isOpen={isDayOpen}
                    onToggle={() => setIsDayOpen(!isDayOpen)}
                    isMini={true}
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <div className={styles.dateLabel}>שעה</div>
                <TimePicker
                  value={formData.startTime}
                  onChange={(val) => setFormValue("startTime", val)}
                />
              </div>
            </div>
          </div>

          {/* STEP 3 */}
          {isStep2Valid && (
            <div className={`${styles.scrollSnapSlide} ${styles.noScroll}`}>
              <div className={styles.slideContent}>
                <div className={styles.previewImageCard}>
                  {imagePreviewUrl ? (
                    <img
                      src={imagePreviewUrl}
                      alt="Preview"
                      className={styles.previewImage}
                    />
                  ) : (
                    <div className={styles.previewImagePlaceholder}>
                      אין תמונה
                    </div>
                  )}
                </div>
                <h2 className={styles.previewTitle}>
                  {formData.title || "שם הפעילות"}
                </h2>
                <div className={styles.previewInfoBlock}>
                  <div className={styles.previewDetailsText}>{`יום ${
                    formData.day
                      ? `${formData.day}.${formData.month}.${formData.year}`
                      : "..."
                  } בשעה ${formData.startTime || "..."}`}</div>
                  <div className={styles.previewDetailsText}>{`בסניף ${
                    formData.branch === "nahalal" ? "נהלל" : "סתריה"
                  }${formData.location ? ` • ${formData.location}` : ""}`}</div>
                  <div className={styles.previewDetailsText}>{`בהנחיית ${
                    formData.instructor || "..."
                  }`}</div>
                  <div className={styles.previewDetailsText}>
                    {formData.max_participants
                      ? `משתתפים: 0/${formData.max_participants}`
                      : "ללא הגבלת משתתפים"}
                  </div>
                </div>
                <div className={styles.previewDescription}>
                  {formData.description || "תיאור הפעילות יופיע כאן..."}
                </div>
                <div className={styles.submitButtonContainer}>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={
                      uploading || submitStatus === "success" || !isFormValid
                    }
                    className={styles.submitButton}
                    style={{ opacity: !isFormValid ? 0.5 : 1 }}
                  >
                    {uploading
                      ? "שומר..."
                      : submitStatus === "success"
                      ? "פורסם!"
                      : "פרסם פעילות"}
                  </button>
                </div>
                {submitStatus === "error" && (
                  <div className={styles.errorBanner}>{errorMessage}</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 4. RENDER POPUP */}
        {showPopup && (
          <div className={styles.popupWrapper}>
            <Popup
              title={popupConfig.title}
              content={popupConfig.content}
              secondaryButtonText="סגור"
              secondaryButtonAction={() => setShowPopup(false)}
              onClose={() => setShowPopup(false)}
            />
          </div>
        )}

        <div className={styles.navigation}>
          <div className={styles.progressDots}>
            {[0, 1, 2].map((step) => (
              <div key={step} className={styles.progressCircle}>
                <Image
                  src={getProgressCircleIcon(step, step === currentStep)}
                  alt={`Step ${step + 1}`}
                  width={17}
                  height={17}
                  className={styles.progressCircleIcon}
                />
              </div>
            ))}
          </div>
        </div>
      </main>
    </SmoothPageWrapper>
  );
}
