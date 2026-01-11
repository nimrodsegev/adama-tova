"use client";

import { useState, useRef, TouchEvent } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/app/services/authService';
import { userService } from '@/app/services/userService';
import styles from './SignupWizard.module.css';
import { useIvrita } from '@/app/contexts/IvritaContext';

interface SignupWizardProps {
  signupType: 'email' | 'google';
  email: string;
  password: string;
  googleUserId?: string;
  onBack: () => void;
}

const CIRCLE_OPTIONS = [
  'שורדי ושורדות המסיבות',
  'נפגעי טראומה 7.10 ומלחמת חרבות ברזל',
  'הורים שכולים',
  'אחים.ות שכולים',
  'משפחות וקרובים של פצועים טראומה בגופם ובנפשם',
  'כוחות הצלה וחילוץ',
  'תושבי העוטף ומפונים',
  'מעגל שני ושלישי של משפחות השכול',
];

const INTEREST_OPTIONS = [
  'יוגה',
  'מדיטציה',
  'אומנות',
  'כתיבה',
  'יצירה',
  'מיינדפולנס',
];

const BRANCH_OPTIONS = [
  { value: 'nahalal', label: 'נהלל' },
  { value: 'satria', label: 'סתריה' },
];

const GENDER_OPTIONS: { value: 'male' | 'female' | 'prefer_not_to_say'; label: string }[] = [
  { value: 'male', label: 'זכר' },
  { value: 'female', label: 'נקבה' },
  { value: 'prefer_not_to_say', label: 'מעדיפ/ה לא לציין' },
];

const TOTAL_STEPS = 5;

export default function SignupWizard({ signupType, email, password, googleUserId, onBack }: SignupWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setGender: setIvritaGender, t } = useIvrita();

  // Form data
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'prefer_not_to_say' | null>(null);
  const [genderDropdownOpen, setGenderDropdownOpen] = useState(false);
  const [circle, setCircle] = useState('');
  const [circleDropdownOpen, setCircleDropdownOpen] = useState(false);
  const [proximity, setProximity] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [freeText, setFreeText] = useState('');

  // Field errors
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Swipe handling
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;

  const isHebrewName = (name: string) => /^[\u0590-\u05FF\s]+$/.test(name);
  const isValidIsraeliMobile = (p: string) => /^05\d{8}$/.test(p.replace(/[-\s]/g, ''));

  const validateStep0 = (): boolean => {
    setNameError('');
    setPhoneError('');

    if (!fullName.trim()) {
      setNameError('שדה חובה');
      return false;
    }
    if (!isHebrewName(fullName.trim())) {
      setNameError('עברית בלבד');
      return false;
    }
    if (!phone.trim()) {
      setPhoneError('שדה חובה');
      return false;
    }
    const cleanPhone = phone.replace(/[-\s]/g, '');
    if (!isValidIsraeliMobile(cleanPhone)) {
      setPhoneError('מספר טלפון לא תקין');
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    if (currentStep === 0) {
      if (!validateStep0()) return;
    }

    if (currentStep === TOTAL_STEPS - 1) {
      await handleSubmit();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  // Swipe handlers
  const onTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null; // Reset end position
  };

  const onTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    // Only process swipe if both start and end positions are set
    // (meaning there was actual movement, not just a tap/click)
    if (touchStartX.current === null || touchEndX.current === null) {
      touchStartX.current = null;
      touchEndX.current = null;
      return;
    }

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    // Swipe right = next (forward), swipe left = back
    if (isRightSwipe) {
      handleNext();
    } else if (isLeftSwipe) {
      handleBack();
    }

    // Reset for next swipe
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      let userId: string;

      if (signupType === 'email') {
        await authService.signUp(email, password);
        const user = await authService.getCurrentUser();

        if (!user) throw new Error('שגיאה ביצירת חשבון');
        userId = user.id;
      } else {
        userId = googleUserId!;
      }

      const cleanPhone = phone.replace(/[-\s]/g, '');

      await userService.completeProfile(userId, email, {
        full_name: fullName.trim(),
        phone: cleanPhone,
        gender: gender || undefined,
        circle: circle || undefined,
        proximity: proximity || undefined,
        interests: interests.length ? interests : undefined,
        branches: branches.length ? branches : undefined,
        free_text: freeText || undefined,
      });

      router.replace('/pending-approval');
    } catch (err: any) {
      setError(err.message || 'שגיאה בשמירה');
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const toggleBranch = (branchValue: string) => {
    setBranches(prev =>
      prev.includes(branchValue)
        ? prev.filter(b => b !== branchValue)
        : [...prev, branchValue]
    );
  };

  // Get dot class based on step state
  const getDotClass = (stepIndex: number) => {
    if (stepIndex < currentStep) return `${styles.dot} ${styles.completedDot}`;
    if (stepIndex === currentStep) return `${styles.dot} ${styles.activeDot}`;
    return styles.dot;
  };

  return (
    <div
      className={styles.wizardContainer}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className={styles.content}>

        {/* Step 0: Personal Details */}
        {currentStep === 0 && (
          <>
            <div className={styles.headerSection}>
              <h2 className={styles.stepTitle}>{t('השלם/י פרטים אישיים')}</h2>
            </div>

            {/* Decorative circle placeholder */}
            <div className={styles.decorativeCircles}>
              <span className={styles.circlePlaceholder}></span>
            </div>

            <div className={styles.stepContainer}>
              <div className={styles.inputsContainer}>
                {/* Full Name */}
                <div className={styles.inputWrapper}>
                  <span className={styles.inputLabel}>שם מלא</span>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      setNameError('');
                    }}
                    className={`${styles.input} ${nameError ? styles.inputError : ''}`}
                    dir="rtl"
                  />
                  {nameError && <span className={styles.fieldError}>{nameError}</span>}
                </div>

                {/* Phone */}
                <div className={styles.inputWrapper}>
                  <span className={styles.inputLabel}>מספר טלפון</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setPhoneError('');
                    }}
                    className={`${styles.input} ${phoneError ? styles.inputError : ''}`}
                    dir="rtl"
                  />
                  {phoneError && <span className={styles.fieldError}>{phoneError}</span>}
                </div>

                {/* Gender Accordion */}
                <div className={styles.genderSelector}>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputLabel}>מין</span>
                    <button
                      type="button"
                      onClick={() => setGenderDropdownOpen(!genderDropdownOpen)}
                      className={`${styles.genderToggle} ${genderDropdownOpen ? styles.open : ''}`}
                    >
                      <span className={!gender ? styles.accordionPlaceholder : ''}>
                        {gender ? GENDER_OPTIONS.find(g => g.value === gender)?.label : t('בחר/י')}
                      </span>
                      <span className={`${styles.genderToggleArrow} ${genderDropdownOpen ? styles.open : ''}`}>▼</span>
                    </button>
                  </div>
                  {genderDropdownOpen && (
                    <div className={styles.genderDropdown}>
                      {GENDER_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setGender(option.value);
                            setIvritaGender(option.value);
                            setGenderDropdownOpen(false);
                          }}
                          className={`${styles.genderOption} ${gender === option.value ? styles.selected : ''}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Step 1: Branch Selection */}
        {currentStep === 1 && (
          <>
            <div className={styles.headerSection}>
              <h2 className={styles.stepTitle}>{t('הסניף הקרוב [אליך|אלייך]')}</h2>
              <p className={styles.optionalSubtitle}>*לא חובה</p>
            </div>

            {/* Decorative circle placeholder */}
            <div className={styles.decorativeCircles}>
              <span className={styles.circlePlaceholder}></span>
            </div>

            <div className={styles.stepContainerLower}>
              <div className={styles.optionsContainer}>
                {BRANCH_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => toggleBranch(option.value)}
                    className={`${styles.optionButton} ${branches.includes(option.value) ? styles.selected : ''}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Step 2: Interests */}
        {currentStep === 2 && (
          <>
            <div className={styles.headerSection}>
              <h2 className={styles.stepTitle}>{t('מה מעניין אותך?')}</h2>
              <p className={styles.optionalSubtitle}>*לא חובה</p>
            </div>

            {/* Decorative circle placeholder */}
            <div className={styles.decorativeCircles}>
              <span className={styles.circlePlaceholder}></span>
            </div>

            <div className={styles.stepContainerLower}>
              <div className={styles.optionsContainer}>
                {INTEREST_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => toggleInterest(option)}
                    className={`${styles.optionButton} ${interests.includes(option) ? styles.selected : ''}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Step 3: Circle Selection (Personal Background) */}
        {currentStep === 3 && (
          <>
            <div className={styles.headerSection}>
              <h2 className={styles.stepTitle}>{t('מאיזה מקום אישי את/ה מגיע/ה אלינו?')}</h2>
              <p className={styles.optionalSubtitle}>*לא חובה</p>
            </div>

            {/* Decorative circle placeholder */}
            <div className={styles.decorativeCircles}>
              <span className={styles.circlePlaceholder}></span>
            </div>

            <div className={styles.stepContainerLower}>
              <div className={styles.inputsContainer}>
                {/* Circle Accordion */}
                <div className={styles.accordionContainer}>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputLabel}>{t('מאיזה מקום אישי את/ה מגיע/ה אלינו?')}</span>
                    <button
                      type="button"
                      onClick={() => setCircleDropdownOpen(!circleDropdownOpen)}
                      className={`${styles.accordionHeader} ${circleDropdownOpen ? styles.open : ''}`}
                    >
                      <span className={!circle ? styles.accordionPlaceholder : ''}>
                        {circle || t('בחר/י')}
                      </span>
                      <span className={`${styles.accordionArrow} ${circleDropdownOpen ? styles.open : ''}`}></span>
                    </button>
                  </div>
                  {circleDropdownOpen && (
                    <div className={styles.accordionDropdown}>
                      {CIRCLE_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setCircle(prev => prev === option ? '' : option);
                            setCircleDropdownOpen(false);
                          }}
                          className={`${styles.accordionOption} ${circle === option ? styles.selected : ''}`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Other/Proximity text field */}
                <div className={styles.inputWrapper}>
                  <span className={styles.inputLabel}>אחר</span>
                  <input
                    type="text"
                    value={proximity}
                    onChange={(e) => setProximity(e.target.value)}
                    className={styles.input}
                    dir="rtl"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Step 4: Free Text - No circle, centered layout */}
        {currentStep === 4 && (
          <div className={styles.lastStepContainer}>
            <div className={styles.lastStepContent}>
              <h2 className={styles.lastStepTitle}>{t('*כל דבר אחר שתרצה/י שנדע:')}</h2>

              <div className={styles.inputWrapper}>
                <span className={styles.inputLabel}>אחר</span>
                <textarea
                  value={freeText}
                  onChange={(e) => setFreeText(e.target.value)}
                  className={styles.textarea}
                  rows={1}
                  dir="rtl"
                />
              </div>

              {/* Submit button for last step */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={styles.submitButton}
              >
                {loading ? '...' : 'סיום'}
              </button>
            </div>
          </div>
        )}

        {error && <p className={styles.error}>{error}</p>}
      </div>

      {/* Progress Diamonds - Fixed at bottom */}
      <div className={styles.navigation}>
        <div className={styles.progressDots}>
          {[0, 1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={getDotClass(step)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}