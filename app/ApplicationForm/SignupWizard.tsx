'use client';

import { useState } from 'react';
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
  'מינדפולנס',
];

// Gender options for display
const GENDER_OPTIONS: { value: 'male' | 'female' | 'prefer_not_to_say'; label: string }[] = [
  { value: 'male', label: 'זכר' },
  { value: 'female', label: 'נקבה' },
  { value: 'prefer_not_to_say', label: 'מעדיפ/ה לא לציין' },
];

export default function SignupWizard({ signupType, email, password, googleUserId, onBack }: SignupWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t, setGender: setIvritaGender } = useIvrita();

  // Form data
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'prefer_not_to_say' | null>(null);
  const [genderDropdownOpen, setGenderDropdownOpen] = useState(false);
  const [circle, setCircle] = useState('');
  const [proximity, setProximity] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [freeText, setFreeText] = useState('');

  // Field errors
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const isHebrewName = (name: string) => /^[\u0590-\u05FF\s]+$/.test(name);
  // Israeli mobile: 05X-XXXXXXX (10 digits starting with 05)
  const isValidIsraeliMobile = (p: string) => /^05\d{8}$/.test(p.replace(/[-\s]/g, ''));

  const validateStep1 = (): boolean => {
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
      if (!validateStep1()) return;
    }

    if (currentStep === 3) {
      await handleSubmit();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      // 🔥 Back from first step → return to login
      onBack();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      let userId: string;

      // 🔥 Create auth account NOW (only if email signup)
      if (signupType === 'email') {
        await authService.signUp(email, password);
        const user = await authService.getCurrentUser();
        
        if (!user) {
          throw new Error('שגיאה ביצירת חשבון');
        }
        
        userId = user.id;
      } else {
        // Google signup - already have userId
        userId = googleUserId!;
      }

      // Create profile in database
      const cleanPhone = phone.replace(/[-\s]/g, '');

      await userService.completeProfile(userId, email, {
        full_name: fullName.trim(),
        phone: cleanPhone,
        gender: gender || undefined,
        circle: circle || undefined,
        proximity: proximity || undefined,
        interests: interests.length ? interests : undefined,
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

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Step 1: Name + Phone */}
        {currentStep === 0 && (
          <div className={`${styles.stepContainer} ${styles.step1}`}>
            <h2 className={styles.stepTitle}>{t('השלם/י את הפרטים הבאים:')}</h2>

            
            <div className={styles.inputsContainer}>
              <div className={styles.inputWrapper}>
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
                <span className={styles.inputLabel}>שם מלא</span>
                {nameError && <span className={styles.fieldError}>{nameError}</span>}
              </div>

              <div className={styles.inputWrapper}>
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
                <span className={styles.inputLabel}>טלפון</span>
                {phoneError && <span className={styles.fieldError}>{phoneError}</span>}
              </div>

              {/* Gender selector (optional) */}
              <div className={styles.genderSelector}>
                <div className={styles.inputWrapper}>
                  <button
                    type="button"
                    onClick={() => setGenderDropdownOpen(!genderDropdownOpen)}
                    className={`${styles.genderToggle} ${genderDropdownOpen ? styles.open : ''}`}
                  >
                    <span>{gender ? GENDER_OPTIONS.find(g => g.value === gender)?.label : 'בחר/י'}</span>
                    <span className={`${styles.genderToggleArrow} ${genderDropdownOpen ? styles.open : ''}`}>▼</span>
                  </button>
                  <span className={styles.inputLabel}>מגדר (אופציונלי)</span>
                </div>
                {genderDropdownOpen && (
                  <div className={styles.genderDropdown}>
                    {GENDER_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setGender(option.value);
                          setIvritaGender(option.value); // Update IvritaContext for immediate text transformation
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
        )}

        {/* Step 2: Circle Selection */}
        {currentStep === 1 && (
          <div className={`${styles.stepContainer} ${styles.step2}`}>
            <h2 className={styles.stepTitle}>{t('מאיזה מקום אישי את/ה מגיע/ה אלינו?')}</h2>

            
            <div className={styles.optionsContainer}>
              {CIRCLE_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() =>
                    setCircle(prev => (prev === option ? '' : option))
                  }
                  className={`${styles.optionButton} ${circle === option ? styles.selected : ''}`}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className={styles.inputsContainer}>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  value={proximity}
                  onChange={(e) => setProximity(e.target.value)}
                  className={styles.input}
                  dir="rtl"
                />
                <span className={styles.inputLabel}>קרבה</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Interests */}
        {currentStep === 2 && (
          <div className={`${styles.stepContainer} ${styles.step3}`}>
            <h2 className={styles.stepTitle}>מה מעניין אותך?</h2>

            
            <div className={styles.optionsContainer}>
              {INTEREST_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => toggleInterest(option)}
                  className={`${styles.optionButton} ${
                    interests.includes(option) ? styles.selected : ''
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Free Text */}
        {currentStep === 3 && (
  <div className={`${styles.stepContainer} ${styles.step4}`}>
    <h2 className={styles.stepTitle}>כל דבר אחר שתרצה שנדע:</h2>

    <div className={styles.textareaWrapper}>
      <div className={styles.inputWrapper}>
        <textarea
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          className={styles.textarea}
          rows={6}
          dir="rtl"
        />
        <span className={styles.inputLabel}>אחר</span>
      </div>
    </div>
  </div>
)}


        {error && <p className={styles.error}>{error}</p>}

        {/* Navigation */}
        <div className={styles.navigation}>
          <div className={styles.navButtons}>
            <button
              onClick={handleNext}
              className={styles.navButton}
              disabled={loading}
            >
              {currentStep === 3 ? (loading ? '...' : '✓') : '←'}
            </button>

            <button
              onClick={handleBack}
              className={styles.navButton}
              disabled={loading}
            >
              →
            </button>
          </div>

          {/* Progress Dots */}
          <div className={styles.progressDots}>
            {[3, 2, 1, 0].map((step) => (
              <div
                key={step}
                className={`${styles.dot} ${currentStep === step ? styles.activeDot : ''}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}