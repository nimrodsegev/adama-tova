"use client";
import { useState, useEffect, useLayoutEffect, useRef } from "react";
import Image from "next/image"; 
import { useRouter, useSearchParams } from "next/navigation";
import { apiActivities } from "@/app/services/db_api";
import { useIvrita } from "@/app/contexts/IvritaContext";
import styles from "./EditActivityPage.module.css";
import SmoothPageWrapper from "@/lib/components/UI/SmoothPageWrapper";
import CutInput from '@/lib/components/UI/CutInput';
import Popup from "@/lib/components/UI/Popup";
import UnifiedDropdown from "@/lib/components/UI/UnifiedDropdown";

const BRANCH_OPTIONS = [
  { value: "satria", label: "סניף סתריה" },
  { value: "nahalal", label: "סניף נהלל" },
];

const DAYS = Array.from({ length: 31 }, (_, i) => ({ value: (i + 1).toString().padStart(2, '0'), label: (i + 1).toString().padStart(2, '0') }));
const MONTHS = Array.from({ length: 12 }, (_, i) => ({ value: (i + 1).toString().padStart(2, '0'), label: (i + 1).toString().padStart(2, '0') }));
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 3 }, (_, i) => ({ value: (CURRENT_YEAR + i).toString(), label: (CURRENT_YEAR + i).toString() }));

// --- SVG Path Generator (Legacy for Image Upload) ---
const getSvgPath = (label: string) => {
  const charWidth = 10; 
  const padding = 20; 
  const labelWidth = (label.length * charWidth) + padding;
  
  const totalWidth = 315;
  const radius = 9; 
  const rightGapStart = 315 - 32; 
  const gapEnd = rightGapStart - labelWidth;

  return `M${gapEnd} 0.5 H${radius} C0.5 0.5 0.5 4 0.5 8.5 V52 C0.5 56.5 4 59.5 ${radius} 59.5 H${totalWidth - radius} C${totalWidth - 4} 59.5 ${totalWidth - 0.5} 56.5 ${totalWidth - 0.5} 52 V8.5 C${totalWidth - 0.5} 4 ${totalWidth - 4} 0.5 ${totalWidth - radius} 0.5 H${rightGapStart}`;
};

// --- CUSTOM SVG ARROW ---
const CustomArrowIcon = ({ className, rotation = 0 }: { className?: string; rotation?: number }) => (
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

// --- Custom Time Picker Component ---
const TimePicker = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
  const [hourStr, minStr] = value ? value.split(':') : ["12", "00"];
  const hour = parseInt(hourStr || "12");
  const minute = parseInt(minStr || "00");

  const updateTime = (newH: number, newM: number) => {
    const hStr = newH.toString().padStart(2, '0');
    const mStr = newM.toString().padStart(2, '0');
    onChange(`${hStr}:${mStr}`);
  };

  const incrementHour = () => updateTime((hour + 1) % 24, minute);
  const decrementHour = () => updateTime((hour - 1 + 24) % 24, minute);
  
  const incrementMinute = () => updateTime(hour, (minute + 5) % 60);
  const decrementMinute = () => updateTime(hour, (minute - 5 + 60) % 60);

  return (
    <div className={styles.timePickerContainer}>
      <div className={styles.timeColumn}>
        <button type="button" onClick={incrementHour} className={styles.timeButton}>
          <CustomArrowIcon rotation={180} />
        </button>
        <span className={styles.timeValue}>{hour.toString().padStart(2, '0')}</span>
        <button type="button" onClick={decrementHour} className={styles.timeButton}>
          <CustomArrowIcon rotation={0} />
        </button>
      </div>
      <div className={styles.timeColumn}>
        <button type="button" onClick={incrementMinute} className={styles.timeButton}>
          <CustomArrowIcon rotation={180} />
        </button>
        <span className={styles.timeValue}>{minute.toString().padStart(2, '0')}</span>
        <button type="button" onClick={decrementMinute} className={styles.timeButton}>
          <CustomArrowIcon rotation={0} />
        </button>
      </div>
    </div>
  );
};

export default function EditActivityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activityId = searchParams.get("id");
  const { t } = useIvrita();

  const [loading, setLoading] = useState(true);
  const [mounting, setMounting] = useState(true);
  const [closing, setClosing] = useState(false); 
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    title: "",
    branch: "" as "satria" | "nahalal" | "",
    location: "", 
    instructor: "",
    maxParticipants: "", 
    description: "",
    date: "", 
    startTime: "",
  });

  const [selectedDay, setSelectedDay] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState(""); 

  const [isBranchOpen, setIsBranchOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isDayOpen, setIsDayOpen] = useState(false);

  const handleCloseWithAnimation = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      router.back();
    }, 400);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounting(false);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (activityId) {
      loadActivity();
    }
  }, [activityId]);

  const loadActivity = async () => {
    try {
      const [data, error] = await apiActivities.getById(activityId!);
      if (error) {
        alert("Error loading activity");
        router.back();
        return;
      }

      setFormData({
        title: data.title || "",
        branch: data.branch || "", 
        location: data.location || "",
        instructor: data.instructor || "",
        maxParticipants: data.max_participants ? data.max_participants.toString() : "",
        description: data.description || "",
        date: data.date || "",
        startTime: data.start_time || "12:00", // Default if missing
      });

      if (data.date) {
        const [y, m, d] = data.date.split('-');
        setSelectedYear(y);
        setSelectedMonth(m);
        setSelectedDay(d);
      }

      if (data.image_url) {
        setImagePreviewUrl(data.image_url);
        const filename = data.image_url.split('/').pop() || "Existing Image";
        setImageName(filename);
      }

    } catch (error) {
      console.error("Error loading activity:", error);
    } finally {
      setLoading(false);
    }
  };

  useLayoutEffect(() => {
    const updateLabelBackgrounds = () => {
      const vh = window.innerHeight;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
      const labels = document.querySelectorAll(`.${styles.inputLabel}`) as NodeListOf<HTMLElement>;
      labels.forEach((el) => {
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--bg-y", `${-rect.top}px`);
      });
    };
    updateLabelBackgrounds();
    window.addEventListener("resize", updateLabelBackgrounds);
    return () => window.removeEventListener("resize", updateLabelBackgrounds);
  }, [loading]);

  const setFormValue = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleDateChange = (type: 'day' | 'month' | 'year', value: string) => {
    if (type === 'day') setSelectedDay(value);
    if (type === 'month') setSelectedMonth(value);
    if (type === 'year') setSelectedYear(value);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImageName(file.name);
    }
  };

  const handleClearImage = () => {
    setImageFile(null);
    setImageName("");
    setImagePreviewUrl(null);
  };

  const handleSaveClick = () => {
    setShowModal(true);
  };

  const handleConfirmUpdate = async () => {
    setShowModal(false);
    setSaving(true);

    try {
      const maxPart = formData.maxParticipants ? parseInt(formData.maxParticipants) : 0;
      let imageUrl = imagePreviewUrl; 
      if (imageFile) {
        const [url, error] = await apiActivities.uploadImage(imageFile);
        if (error) throw new Error("Image upload failed");
        imageUrl = url;
      }

      const fullDate = (selectedYear && selectedMonth && selectedDay) 
        ? `${selectedYear}-${selectedMonth}-${selectedDay}` 
        : formData.date;

      const updates = {
        title: formData.title,
        description: formData.description,
        branch: formData.branch,
        location: formData.location,
        max_participants: maxPart,
        instructor: formData.instructor,
        image_url: imageUrl,
        date: fullDate,
        start_time: formData.startTime,
      };

      const [_, error] = await apiActivities.update(activityId!, updates);
      if (error) throw new Error(error);

      router.back();
    } catch (error) {
      console.error("Error updating:", error);
      alert("שגיאה בעדכון הפעילות");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SmoothPageWrapper isLoading={loading || mounting || closing}>
    <main className={`mobile-container ${styles.pageOverride}`}>
      
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
        <h1 className={styles.headerTitle}>עריכת פעילות</h1>
      </div>

      <div className={styles.scrollContainer}>
        
        {/* Title */}
        <CutInput
            label="שם הפעילות"
            value={formData.title}
            onChange={(e) => setFormValue('title', e.target.value)}
            className={styles.cutInput}
            type="text"
            dir="rtl"
            textAlign="right"
        />  
        
        {/* Branch Dropdown */}
        <div 
          className={`${styles.dropdownContainer} ${isBranchOpen ? styles.activeDropdownWrapper : ''}`}
        >
          <UnifiedDropdown
            label="סניף"
            placeholder="בחר/י סניף"
            options={BRANCH_OPTIONS}
            value={formData.branch}
            onChange={(value) => setFormValue('branch', value)}
            isOpen={isBranchOpen}
            onToggle={() => setIsBranchOpen(!isBranchOpen)}
          />
        </div>

        {/* Location */}
        <CutInput
            label="מיקום"
            value={formData.location}
            onChange={(e) => setFormValue('location', e.target.value)}
            className={styles.cutInput}
            type="text"
            dir="rtl"
            textAlign="right"
        />  
        {/* Instructor */}
        <CutInput
            label="מנחה"
            value={formData.instructor}
            onChange={(e) => setFormValue('instructor', e.target.value)}
            className={styles.cutInput}
            type="text"
            dir="rtl"
            textAlign="right"
        />  

        {/* Max Participants */}
        <CutInput
            label="מספר משתתפים"
            value={formData.maxParticipants}
            onChange={(e) => setFormValue('maxParticipants', e.target.value)}
            className={styles.cutInput}
            type="number"
            dir="rtl"
            textAlign="right"
        />  

        {/* Date Row */}
        <div className={styles.fieldGroup}>
          <div className={styles.dateLabel}>{'תאריך'}</div>
          <div className={styles.dateRow}>
            {/* YEAR */}
            <div 
              className={`${styles.miniDropdownWrapper} ${isYearOpen ? styles.activeDropdownWrapper : ''}`}
            >
              <UnifiedDropdown
                label="שנה"
                options={YEARS}
                value={selectedYear}
                onChange={(value) => handleDateChange('year', value)}
                isOpen={isYearOpen}
                onToggle={() => setIsYearOpen(!isYearOpen)}
                isMini={true}
              />
            </div>

            {/* MONTH */}
            <div 
              className={`${styles.miniDropdownWrapper} ${isMonthOpen ? styles.activeDropdownWrapper : ''}`}
            >
              <UnifiedDropdown
                label="חודש"
                options={MONTHS}
                value={selectedMonth}
                onChange={(value) => handleDateChange('month', value)}
                isOpen={isMonthOpen}
                onToggle={() => setIsMonthOpen(!isMonthOpen)}
                isMini={true}
              />
            </div>

            {/* DAY */}
            <div 
              className={`${styles.miniDropdownWrapper} ${isDayOpen ? styles.activeDropdownWrapper : ''}`}
            >
              <UnifiedDropdown
                label="יום"
                options={DAYS}
                value={selectedDay}
                onChange={(value) => handleDateChange('day', value)}
                isOpen={isDayOpen}
                onToggle={() => setIsDayOpen(!isDayOpen)}
                isMini={true}
              />
            </div>
          </div>
        </div>

        {/* Time Row - REPLACED WITH TIME PICKER */}
        <div className={styles.fieldGroup}>
          <div className={styles.dateLabel}>שעה</div>
          <TimePicker 
            value={formData.startTime} 
            onChange={(val) => setFormValue('startTime', val)} 
          />
        </div>

        {/* Image Upload */}
        <div className={styles.imageWrapperSVG}>
          <svg className={styles.imageBorderSVG} viewBox="0 0 315 61" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d={getSvgPath("תמונה")} className={styles.imageBorderPath} strokeLinecap="round" />
          </svg>
          <span className={styles.imageLabelSVG}>תמונה</span>

          <input type="file" id="editImageUpload" accept="image/*" onChange={handleImageChange} hidden />
          {imageName ? (
            <div className={styles.filePreviewBox}>
              <div style={{display:'flex', alignItems:'center', flex:1, overflow:'hidden'}}>
                  <span className={styles.fileName}>{imageName}</span>
              </div>
              <div style={{display:'flex', alignItems:'center'}}>
                  <span style={{width:'3px', height:'3px', background:'#fff', borderRadius:'50%'}}></span>
                  <span className={styles.previewLabel}>preview</span>
                  <button onClick={handleClearImage} style={{background:'none', border:'none', cursor:'pointer', padding:'0 5px', color:'#fff', fontSize:'1.2rem', lineHeight: '1'}}>✕</button>
              </div>
            </div>
          ) : (
            <label htmlFor="editImageUpload" className={styles.uploadBox}>
              <span className={styles.uploadText}>לחץ/י כאן על מנת לבחור תמונה</span>
              <div className={styles.paperclipWrapper}>
                <svg width="16" height="17" viewBox="0 0 16 17" fill="none">
                  <path d="M14.8131 7.87167L7.92063 14.7642C7.07624 15.6086 5.93102 16.0829 4.73688 16.0829C3.54274 16.0829 2.39751 15.6086 1.55313 14.7642C0.708744 13.9198 0.234375 12.7746 0.234375 11.5804C0.234375 10.3863 0.708744 9.24105 1.55313 8.39667L8.44563 1.50417C9.00855 0.941246 9.77204 0.625 10.5681 0.625C11.3642 0.625 12.1277 0.941246 12.6906 1.50417C13.2536 2.06709 13.5698 2.83058 13.5698 3.62667C13.5698 4.42276 13.2536 5.18625 12.6906 5.74917L5.79063 12.6417C5.50917 12.9231 5.12742 13.0813 4.72938 13.0813C4.33133 13.0813 3.94959 12.9231 3.66813 12.6417C3.38667 12.3602 3.22854 11.9785 3.22854 11.5804C3.22854 11.1824 3.38667 10.8006 3.66813 10.5192L10.0356 4.15917" stroke="#F9F9F9" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </label>
          )}
        </div>

        {/* Description */}
        <div className={styles.inputWrapper}>
          <CutInput
            label="תיאור"
            value={formData.description}
            onChange={(e) => setFormValue('description', e.target.value)}
            className={styles.tallInput}
            type="text"
            dir="rtl"
            textAlign="right"
            tall={true}
        />  
          
          <div className={styles.saveButtonContainer}>
            <button onClick={handleSaveClick} disabled={saving} className={styles.saveButton}>
                {saving ? "שומר..." : "סיים עריכה"}
            </button>
          </div>
        </div>

      </div>

      {/* MODAL */}
      {showModal && (
        <Popup
          content="האם תרצה לשלוח עדכון למשתתפים על השינויים שביצעת?"
          recommendation="העדכון ישלח לכל המשתתפים."
          primaryButtonText="לשלוח עדכון"
          primaryButtonAction={handleConfirmUpdate}
          secondaryButtonText="לא עכשיו"
          secondaryButtonAction={() => setShowModal(false)}
          onClose={() => setShowModal(false)}
        />
      )}

    </main>
    </SmoothPageWrapper>
  );
}