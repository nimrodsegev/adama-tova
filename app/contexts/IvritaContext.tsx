/**
 * IVRITA CONTEXT
 * Provides Hebrew gender-inclusive text transformation throughout the app.
 * Uses the Ivrita library (https://github.com/AlefAlefAlef/ivrita).
 */

'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
// Import directly from ivrita's main source to get the genderize function and constants
import { genderize, ORIGINAL, MALE, FEMALE, NEUTRAL } from 'ivrita/src/ivrita';

// Re-export Ivrita constants for use elsewhere
export { ORIGINAL, MALE, FEMALE, NEUTRAL };

// Database enum values (matches Supabase gender_type enum)
export type GenderType = 'male' | 'female' | 'neutral' | 'prefer_not_to_say' | null;

// Map database gender to Ivrita mode
const GENDER_TO_MODE: Record<string, number> = {
  'male': MALE,
  'female': FEMALE,
  'neutral': NEUTRAL,
  'prefer_not_to_say': ORIGINAL,
};

interface IvritaContextType {
  gender: GenderType;
  setGender: (gender: GenderType) => void;
  t: (text: string) => string;
}

const IvritaContext = createContext<IvritaContextType | undefined>(undefined);

export function IvritaProvider({
  children,
  initialGender = null,
}: {
  children: ReactNode;
  initialGender?: GenderType;
}) {
  const [gender, setGender] = useState<GenderType>(initialGender);

  const ivritaMode = gender ? GENDER_TO_MODE[gender] ?? MALE : MALE;

  const t = useCallback((text: string): string => {
    if (!text) return text;
    try {
      return genderize(text, ivritaMode);
    } catch (error) {
      console.error('Ivrita error:', error);
      return text;
    }
  }, [ivritaMode]);

  useEffect(() => {
    if (initialGender !== undefined) {
      setGender(initialGender);
    }
  }, [initialGender]);

  return (
    <IvritaContext.Provider value={{ gender, setGender, t }}>
      {children}
    </IvritaContext.Provider>
  );
}

export function useIvrita() {
  const context = useContext(IvritaContext);
  if (!context) {
    throw new Error('useIvrita must be used within an IvritaProvider');
  }
  return context;
}
