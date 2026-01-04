"use client";
import { useState, useEffect } from "react";
import ProtectedRoute from "@/lib/components/ProtectedRoute";
import { useUser } from "@/app/contexts/UserContext";
import { useIvrita } from "@/app/contexts/IvritaContext";
import { useRouter } from "next/navigation";
import { apiUser } from "@/app/services/db_api";

// Available options for Interests
const AVAILABLE_INTERESTS = [
  "מדיטציה", "יוגה", "אומנות", 
  "כתיבה", "מיינדפולנס", "יצירה",
];

export default function ProfilePage() {
  const { user, userProfile, loading, signOut } = useUser();
  const { t } = useIvrita();
  const router = useRouter();

  // --- STATE ---
  const [branches, setBranches] = useState<string[]>([]);
  
  // Phone Editing State
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [phone, setPhone] = useState("");
  
  // Interests Editing State
  const [isEditingInterests, setIsEditingInterests] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  
  const [saving, setSaving] = useState(false);

  // --- EFFECT: Load Data ---
  useEffect(() => {
    if (userProfile) {
      // 1. Branches
      if (userProfile.branches && userProfile.branches.length > 0) {
        setBranches(userProfile.branches);
      } else {
        setBranches(['nahalal', 'satria']);
      }

      // 2. Phone
      setPhone(userProfile.phone || "");

      // 3. Interests
      if (userProfile.quiz?.interests) {
        setSelectedInterests(userProfile.quiz.interests);
      }
    }
  }, [userProfile]);

  const handleLogout = async () => {
    await signOut();
    router.replace("/login");
    router.refresh();
  };

  // --- HANDLERS: Branches ---
  const toggleBranch = async (branch: string) => {
    if (!user) return;
    let newBranches = [];
    if (branches.includes(branch)) {
      if (branches.length === 1) return alert(t("חובה לבחור לפחות סניף אחד"));
      newBranches = branches.filter((b) => b !== branch);
    } else {
      newBranches = [...branches, branch];
    }
    setBranches(newBranches);
    await apiUser.updateUserBranches(user.id, newBranches);
  };

  // --- HANDLERS: Phone ---
  const handleSavePhone = async () => {
    if (!user) return;
    setSaving(true);
    
    // Clean phone (remove dashes/spaces)
    const cleanPhone = phone.replace(/[-\s]/g, '');
    
    // Basic validation (Israeli mobile)
    const isValid = /^05\d{8}$/.test(cleanPhone);
    if (!isValid) {
      alert("מספר טלפון לא תקין. נא להזין 10 ספרות (לדוגמה: 0501234567)");
      setSaving(false);
      return;
    }

    const [_, error] = await apiUser.updateUserPhone(user.id, cleanPhone);
    
    if (error) {
      alert("שגיאה בעדכון: " + error);
    } else {
      alert("הטלפון עודכן בהצלחה! ✅");
      setIsEditingDetails(false);
      window.location.reload(); // Refresh to update context
    }
    setSaving(false);
  };

  // --- HANDLERS: Interests ---
  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(prev => prev.filter(i => i !== interest));
    } else {
      setSelectedInterests(prev => [...prev, interest]);
    }
  };

  const handleSaveInterests = async () => {
    if (!user) return;
    setSaving(true);
    const [_, error] = await apiUser.updateUserInterests(user.id, selectedInterests);

    if (error) {
      alert("שגיאה בעדכון: " + error);
    } else {
      alert("תחומי העניין עודכנו בהצלחה! ✅");
      setIsEditingInterests(false);
      window.location.reload();
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div style={{ padding: "2rem", textAlign: "center" }}>טוען...</div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="content" style={{ padding: "2rem", direction: "rtl", maxWidth: "800px", margin: "0 auto" }}>
        
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1>הפרופיל שלי</h1>
          <button
            onClick={handleLogout}
            style={{
              padding: "0.75rem 1.5rem",
              background: "#681F02",
              color: "white",
              border: "none",
              borderRadius: "1.5625rem",
              cursor: "pointer",
            }}
          >
            {t("התנתק/י")}
          </button>
        </div>

        {/* 1. PERSONAL DETAILS (Editable Phone) */}
        <div style={{ marginTop: "2rem", background: "#f5f5f5", padding: "1.5rem", borderRadius: "8px" }}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
             <h2 style={{ margin: 0 }}>פרטים אישיים</h2>
             {!isEditingDetails && (
               <button 
                 onClick={() => setIsEditingDetails(true)} 
                 style={{background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontWeight: 'bold'}}
               >
                 ✏️ עריכה
               </button>
             )}
          </div>
          
          <p><strong>שם מלא:</strong> {userProfile?.full_name || "לא צוין"}</p>
          <p><strong>אימייל:</strong> {userProfile?.email || user?.email}</p>
          
          {/* Phone Field - Toggle between Text and Input */}
          <div style={{ marginTop: '10px' }}>
            <strong>טלפון: </strong>
            {isEditingDetails ? (
              <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                <input 
                  type="text" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  dir="ltr"
                />
                <button 
                  onClick={handleSavePhone} 
                  disabled={saving}
                  style={{ background: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}
                >
                  ✓ שמור
                </button>
                <button 
                  onClick={() => { setIsEditingDetails(false); setPhone(userProfile?.phone || ""); }} 
                  style={{ background: '#9ca3af', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}
                >
                  ביטול
                </button>
              </div>
            ) : (
              <span>{userProfile?.phone || "לא צוין"}</span>
            )}
          </div>
        </div>

        {/* 2. BRANCH PREFERENCES */}
        <div style={{ marginTop: "2rem", background: "#fff", border: "1px solid #ddd", padding: "1.5rem", borderRadius: "8px" }}>
          <h2 style={{ marginTop: 0 }}>סניף מועדף</h2>
          <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: "1rem" }}>
            {t("בחר/י את הסניפים בהם תרצה/י לראות פעילויות:")}
          </p>
          
          <div style={{ display: "flex", gap: "1rem" }}>
            {['nahalal', 'satria'].map((branch) => {
              const isSelected = branches.includes(branch);
              const label = branch === 'nahalal' ? 'נהלל' : 'סטריה';
              return (
                <button
                  key={branch}
                  onClick={() => toggleBranch(branch)}
                  style={{
                    flex: 1,
                    padding: "1rem",
                    borderRadius: "8px",
                    border: isSelected ? "2px solid #3b82f6" : "1px solid #ccc",
                    background: isSelected ? "#eff6ff" : "#f9fafb",
                    color: isSelected ? "#1d4ed8" : "#666",
                    fontWeight: isSelected ? "bold" : "normal",
                    cursor: "pointer",
                    fontSize: "1rem",
                    transition: "all 0.2s ease"
                  }}
                >
                  {isSelected && "✓ "} {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. INTERESTS (Editable) */}
        <div style={{ marginTop: "2rem", background: "#e8f4f8", padding: "1.5rem", borderRadius: "8px" }}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
             <h2 style={{ margin: 0 }}>תחומי עניין</h2>
             {!isEditingInterests && (
               <button 
                 onClick={() => setIsEditingInterests(true)} 
                 style={{background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontWeight: 'bold'}}
               >
                 ✏️ עריכה
               </button>
             )}
          </div>

          {isEditingInterests ? (
            // --- EDIT MODE ---
            <div>
              <p style={{fontSize: '0.9rem', color: '#666'}}>בחר/י תחומים:</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
                {AVAILABLE_INTERESTS.map((tag) => {
                   const isSelected = selectedInterests.includes(tag);
                   return (
                     <button
                       key={tag}
                       onClick={() => toggleInterest(tag)}
                       style={{
                         padding: '8px',
                         borderRadius: '8px',
                         border: 'none',
                         background: isSelected ? '#3b82f6' : 'white',
                         color: isSelected ? 'white' : '#4b5563',
                         cursor: 'pointer',
                         fontWeight: 'bold',
                         fontSize: '0.9rem'
                       }}
                     >
                       {tag} {isSelected && "✓"}
                     </button>
                   );
                })}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={handleSaveInterests} 
                  disabled={saving}
                  style={{ flex: 1, padding: '10px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  {saving ? 'שומר...' : 'שמור שינויים'}
                </button>
                <button 
                   onClick={() => { 
                     setIsEditingInterests(false); 
                     // Reset to original
                     if (userProfile?.quiz?.interests) setSelectedInterests(userProfile.quiz.interests);
                   }} 
                   style={{ padding: '10px 20px', background: '#d1d5db', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                   ביטול
                </button>
              </div>
            </div>
          ) : (
            // --- VIEW MODE ---
            <div>
               {selectedInterests.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedInterests.map((interest, i) => (
                    <span key={i} style={{ background: 'white', padding: '4px 12px', borderRadius: '16px', fontSize: '0.9rem', color: '#0369a1', fontWeight: '500' }}>
                      {interest}
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{fontStyle: 'italic', color: '#666'}}>לא נבחרו תחומי עניין.</p>
              )}
            </div>
          )}

          {/* Extra Quiz Info (Read Only) */}
          {userProfile?.quiz && (
             <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #bfdbfe' }}>
                {userProfile.quiz.circle && (
                  <p><strong>מעגל:</strong> {userProfile.quiz.circle}</p>
                )}
                {userProfile.quiz.free_text && (
                  <div style={{ marginTop: "1rem" }}>
                    <strong>טקסט חופשי:</strong>
                    <p style={{ marginTop: "0.5rem", padding: "1rem", background: "white", borderRadius: "4px", whiteSpace: "pre-wrap" }}>
                      {userProfile.quiz.free_text}
                    </p>
                  </div>
                )}
             </div>
          )}
        </div>

        {/* Admin Badge */}
        {userProfile?.role === "admin" && (
          <div style={{ marginTop: "2rem", background: "#fff3cd", border: "2px solid #ffc107", padding: "1rem", borderRadius: "8px", textAlign: "center" }}>
            <p style={{ margin: 0, fontWeight: "bold" }}>🔑 יש לך הרשאות מנהל</p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}