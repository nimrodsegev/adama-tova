"use client";
import { useState, useRef, useMemo, useLayoutEffect, useEffect } from "react";
import Image from "next/image"; // Added for the icon
import { useRouter } from "next/navigation";
import { apiActivities } from "@/app/services/db_api";
import { useIvrita } from "@/app/contexts/IvritaContext";
import styles from "./AddActivityPage.module.css";
import SmoothPageWrapper from "@/lib/components/UI/SmoothPageWrapper";
import CutInput from '@/lib/components/UI/CutInput';
import UnifiedDropdown from "@/lib/components/UI/UnifiedDropdown";

// --- Types ---
type ActivityStatus = "open" | "closed" | "cancelled";
type ActivityCategory = "mindfulness" | "body_motion" | "music_sound" | "creation_material";
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

// --- Options Data ---
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
  "Nova Survivor": "שורדי ושורדות המסיבות",
  "October 7 victim": "נפגעי טראומה 7.10 ומלחמת חרבות ברזל",
  "Shkulim parents": "הורים שכולים",
  "Shkulim Siblings": "אחים.ות שכולים",
  "Family of october 7 victim": "משפחות וקרובים של פצועים טראומה",
  "Rescue forces": "כוחות הצלה וחילוץ",
  "Residence of Otef Aza": "תושבי העוטף ומפונים",
  "Second or third": "מעגל שני ושלישי של משפחות השכול",
};

// --- Date Helpers ---
const DAYS = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
const MONTHS = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 3 }, (_, i) => (CURRENT_YEAR + i).toString());

export default function AddActivityPage() {
  const router = useRouter();
  const { t } = useIvrita();

  // Force a "mounting" state for smooth page transition
  const [mounting, setMounting] = useState(true);
  const [closing, setClosing] = useState(false); // New closing state

  // --- Refs & State ---
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  // Dropdown Open States
  const [isBranchOpen, setIsBranchOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isCircleOpen, setIsCircleOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isDayOpen, setIsDayOpen] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    title: "",
    branch: "" as ActivityBranch | "",
    location: "",
    instructor: "",
    max_participants: "",
    description: "",
    type: "workshop", 
    day: "", month: "", year: "",
    startTime: "", 
    category: "" as ActivityCategory | "",
    circle: "" as GroupCircles | "",
    weeks: "", 
    whatsapp_group_url: "",
    status: "open" as ActivityStatus,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // --- Close Animation Handler ---
  const handleCloseWithAnimation = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      router.back();
    }, 400);
  };

  // --- Validation ---
  const isStep1Valid = useMemo(() => {
    return (
      formData.title.trim() !== "" &&
      formData.branch !== "" &&
      formData.instructor.trim() !== ""
    );
  }, [formData.title, formData.branch, formData.instructor]);

  const isStep2Valid = useMemo(() => {
    const baseDateValid = formData.day && formData.month && formData.year && formData.startTime;
    if (!baseDateValid) return false;
    if (formData.type === 'workshop') return !!formData.category;
    if (formData.type === 'group') return !!formData.circle;
    return true;
  }, [formData]);

  const isFormValid = isStep1Valid && isStep2Valid;
  const isScrollLocked = (currentStep === 0 && !isStep1Valid) || (currentStep === 1 && !isStep2Valid);

  // --- Handlers ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const setFormValue = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
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

  // Turn off mounting after a tiny delay to trigger the animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounting(false);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Update label backgrounds
  useLayoutEffect(() => {
    const updateLabelBackgrounds = () => {
      const vh = window.innerHeight;
      document.documentElement.style.setProperty("--vh", `${vh}px`);

      const labels = document.querySelectorAll(
        `.${styles.inputLabel}, .${styles.uploadSubtext}`
      ) as NodeListOf<HTMLElement>;

      labels.forEach((el) => {
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--bg-y", `${-rect.top}px`);
      });
    };

    updateLabelBackgrounds();
    const raf = requestAnimationFrame(updateLabelBackgrounds);

    window.addEventListener("resize", updateLabelBackgrounds);
    window.addEventListener("orientationchange", updateLabelBackgrounds);
    
    const slides = document.querySelectorAll(`.${styles.scrollSnapSlide}`);
    slides.forEach(slide => {
        slide.addEventListener("scroll", updateLabelBackgrounds, { passive: true });
    });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", updateLabelBackgrounds);
      window.removeEventListener("orientationchange", updateLabelBackgrounds);
      slides.forEach(slide => {
        slide.removeEventListener("scroll", updateLabelBackgrounds);
      });
    };
  }, []);

  const handleSubmit = async () => {
    if (!isFormValid) return;
    setSubmitStatus("idle");
    setErrorMessage("");
    setUploading(true);

    const fullDate = `${formData.year}-${formData.month}-${formData.day}`;
    let endTime = "";
    if (formData.startTime) {
      const [h, m] = formData.startTime.split(':').map(Number);
      const endH = (h + 1) % 24;
      endTime = `${endH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
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

    const isGroup = formData.type === 'group';
    const activityObject = {
      title: formData.title,
      description: formData.description,
      branch: formData.branch,
      location: formData.location || "לא צוין",
      instructor: formData.instructor,
      max_participants: formData.max_participants ? parseInt(formData.max_participants) : 0,
      image_url: imageUrl,
      date: fullDate,
      start_time: formData.startTime,
      end_time: endTime,
      status: formData.status,
      is_group: isGroup,
      weeks: isGroup ? (parseInt(formData.weeks) || 1) : 1,
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

  const formattedDate = `${formData.day}.${formData.month}.${formData.year}`;

  return (
    // Update wrapper to accept closing state
    <SmoothPageWrapper isLoading={mounting || closing}>
    <main className={`mobile-container ${styles.pageOverride}`}>
      
      {/* NEW CLOSE BUTTON */}
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

      <div className={styles.header}>
        <h1 className="header-primary" style={{ color: 'var(--color-text-primary)' }}>הוספת פעילות</h1>
      </div>

      <div 
        ref={scrollContainerRef} 
        className={`${styles.scrollSnapContainer} ${isScrollLocked ? styles.scrollLocked : ''}`}
        onScroll={handleScroll}
      >
        {/* ================= STEP 1 ================= */}
        <div className={styles.scrollSnapSlide}>
          <div className={styles.slideContent}>
            
            <CutInput
            label="שם הפעילות"
            value={formData.title}
            onChange={(e) => setFormValue('title', e.target.value)}
            className={styles.cutInput}
            type="text"
            dir="rtl"
            textAlign="right"
        />  
            <UnifiedDropdown
              label="סניף"
              placeholder="בחר/י סניף"
              options={BRANCH_OPTIONS.map(opt => ({ value: opt.value, label: opt.label }))}
              value={formData.branch}
              onChange={(value) => setFormValue('branch', value)}
              isOpen={isBranchOpen}
              onToggle={() => setIsBranchOpen(!isBranchOpen)}
            />
            <CutInput
            label="מיקום"
            value={formData.location}
            onChange={(e) => setFormValue('location', e.target.value)}
            className={styles.cutInput}
            type="text"
            dir="rtl"
            textAlign="right"
        />  
            <CutInput
            label="מנחה"
            value={formData.instructor}
            onChange={(e) => setFormValue('instructor', e.target.value)}
            className={styles.cutInput}
            type="text"
            dir="rtl"
            textAlign="right"
        />  
            <CutInput
            label="מספר משתתפים מקסימלי"
            value={formData.max_participants}
            onChange={(e) => setFormValue('max_participants', e.target.value)}
            className={styles.cutInput}
            type="number"
            dir="rtl"
            textAlign="right"
        />  

            <div className={styles.uploadWrapper}>
              <input type="file" id="imageUpload" accept="image/*" onChange={handleImageChange} hidden />
              <label htmlFor="imageUpload" className={styles.uploadBox}>
                <div className={styles.paperclipWrapper}>
                  <svg className={styles.paperclipIcon} width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.8131 7.87167L7.92063 14.7642C7.07624 15.6086 5.93102 16.0829 4.73688 16.0829C3.54274 16.0829 2.39751 15.6086 1.55313 14.7642C0.708744 13.9198 0.234375 12.7746 0.234375 11.5804C0.234375 10.3863 0.708744 9.24105 1.55313 8.39667L8.44563 1.50417C9.00855 0.941246 9.77204 0.625 10.5681 0.625C11.3642 0.625 12.1277 0.941246 12.6906 1.50417C13.2536 2.06709 13.5698 2.83058 13.5698 3.62667C13.5698 4.42276 13.2536 5.18625 12.6906 5.74917L5.79063 12.6417C5.50917 12.9231 5.12742 13.0813 4.72938 13.0813C4.33133 13.0813 3.94959 12.9231 3.66813 12.6417C3.38667 12.3602 3.22854 11.9785 3.22854 11.5804C3.22854 11.1824 3.38667 10.8006 3.66813 10.5192L10.0356 4.15917" stroke="#F9F9F9" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className={styles.uploadText}>
                  {imageFile ? imageFile.name : "לחץ/י כאן על מנת לבחור תמונה"}
                </span>
                <span className={styles.uploadSubtext}>
                  תמונה <span className={styles.optionalText}>*לא חובה</span>
                </span>
              </label>
            </div>

            <CutInput
            label="תיאור"
            value={formData.description}
            onChange={(e) => setFormValue('description', e.target.value)}
            className={styles.cutInput}
            type="text"
            dir="rtl"
            textAlign="right"
        />  
          </div>
        </div>

        {/* ================= STEP 2 ================= */}
        <div className={styles.scrollSnapSlide}>
          <div className={styles.slideContent}>
            
            <UnifiedDropdown
              label="סוג פעילות"
              placeholder="בחר/י"
              options={TYPE_OPTIONS.map(opt => ({ value: opt.value, label: opt.label }))}
              value={formData.type}
              onChange={(value) => setFormValue('type', value)}
              isOpen={isTypeOpen}
              onToggle={() => setIsTypeOpen(!isTypeOpen)}
            />
            {formData.type === 'workshop' && (
              <UnifiedDropdown
                label="תחום עניין"
                placeholder="בחר/י"
                options={CATEGORY_OPTIONS.map(opt => ({ value: opt.value, label: opt.label }))}
                value={formData.category}
                onChange={(value) => setFormValue('category', value)}
                isOpen={isCategoryOpen}
                onToggle={() => setIsCategoryOpen(!isCategoryOpen)}
              />
            )}
            {formData.type === 'group' && (
              <>
                <UnifiedDropdown
                  label="קבוצת יעד"
                  placeholder="בחר/י"
                  options={CIRCLE_OPTIONS.map(opt => ({ value: opt, label: CIRCLE_LABELS[opt] }))}
                  value={formData.circle}
                  onChange={(value) => setFormValue('circle', value)}
                  isOpen={isCircleOpen}
                  onToggle={() => setIsCircleOpen(!isCircleOpen)}
                />
                <CutInput
                  label="מספר מפגשים"
                  value={formData.weeks}
                  onChange={(e) => setFormValue('weeks', e.target.value)}
                  className={styles.cutInput}
                  type="text"
                  dir="rtl"
                  textAlign="right"
                 />  
              </>
            )}

            <div className={styles.fieldGroup}>
              <div className={styles.dateLabel}>{formData.type === 'group' ? 'תאריך התחלה' : 'תאריך'}</div>
              <div className={styles.dateRow}>
                {/* YEAR */}
                <UnifiedDropdown
                  label="שנה"
                  placeholder="שנה"
                  options={YEARS.map(y => ({ value: y, label: y }))}
                  value={formData.year}
                  onChange={(value) => setFormValue('year', value)}
                  isOpen={isYearOpen}
                  onToggle={() => setIsYearOpen(!isYearOpen)}
                  isMini={true}
                />

                {/* MONTH */}
                <UnifiedDropdown
                  label="חודש"
                  placeholder="חודש"
                  options={MONTHS.map(m => ({ value: m, label: m }))}
                  value={formData.month}
                  onChange={(value) => setFormValue('month', value)}
                  isOpen={isMonthOpen}
                  onToggle={() => setIsMonthOpen(!isMonthOpen)}
                  isMini={true}
                />

                {/* DAY */}
                <UnifiedDropdown
                  label="יום"
                  placeholder="יום"
                  options={DAYS.map(d => ({ value: d, label: d }))}
                  value={formData.day}
                  onChange={(value) => setFormValue('day', value)}
                  isOpen={isDayOpen}
                  onToggle={() => setIsDayOpen(!isDayOpen)}
                  isMini={true}
                />
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <div className={styles.dateLabel}>שעה</div>
              <div className="input-wrapper">
                  <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className="input-field" style={{ direction: 'ltr', textAlign: 'right' }} />
              </div>
            </div>
          </div>
        </div>

        {/* ... (Step 3) ... */}
        <div className={styles.scrollSnapSlide}>
          <div className={styles.slideContent}>
            <div className={styles.previewImageCard}>
              {imagePreviewUrl ? (
                <img src={imagePreviewUrl} alt="Preview" className={styles.previewImage} />
              ) : (
                <div className={styles.previewImagePlaceholder}>אין תמונה</div>
              )}
            </div>
            <h2 className={styles.previewTitle}>{formData.title || "שם הפעילות"}</h2>
            <div className={styles.previewInfoBlock}>
              <div className={styles.previewDetailsText}>{`יום ${formData.day ? `${formData.day}.${formData.month}.${formData.year}` : '...'} בשעה ${formData.startTime || '...'}`}</div>
              <div className={styles.previewDetailsText}>{`בסניף ${formData.branch === 'nahalal' ? 'נהלל' : 'סתריה'}${formData.location ? ` • ${formData.location}` : ''}`}</div>
              <div className={styles.previewDetailsText}>{`בהנחיית ${formData.instructor || '...'}`}</div>
              <div className={styles.previewDetailsText}>{formData.max_participants ? `משתתפים: 0/${formData.max_participants}` : 'ללא הגבלת משתתפים'}</div>
            </div>
            <div className={styles.previewDescription}>{formData.description || "תיאור הפעילות יופיע כאן..."}</div>
            <div className={styles.submitButtonContainer}>
              <button type="button" onClick={handleSubmit} disabled={uploading || submitStatus === 'success' || !isFormValid} className={styles.submitButton} style={{ opacity: !isFormValid ? 0.5 : 1 }}>
                {uploading ? "שומר..." : submitStatus === 'success' ? "פורסם!" : "פרסם פעילות"}
              </button>
            </div>
            {submitStatus === "error" && <div className={styles.errorBanner}>{errorMessage}</div>}
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.dotsContainer}>
          {[2, 1, 0].map(s => (
            <div key={s} className={`${styles.dot} ${currentStep === s ? styles.activeDot : ''}`} />
          ))}
        </div>
      </div>
    </main>
    </SmoothPageWrapper>
  );
}