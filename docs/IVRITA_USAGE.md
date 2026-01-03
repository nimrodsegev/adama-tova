# Ivrita Integration Guide

This document explains how to use the Ivrita library for Hebrew gender-inclusive text transformation in the app.

## Overview

[Ivrita](https://github.com/AlefAlefAlef/ivrita) is a JavaScript library that transforms Hebrew text to match the user's selected gender. The integration syncs with the user's gender selection stored in the database.

## Setup (Already Done)

The following components are already set up:

1. **IvritaContext** (`app/contexts/IvritaContext.tsx`) - Provides the `t()` function and gender state
2. **AppProviders** (`app/providers/AppProviders.tsx`) - Wraps both UserProvider and IvritaProvider
3. **Gender field** in user profile - Stored in Supabase `users.gender` column

## Usage

### 1. Import the hook

```tsx
import { useIvrita } from '@/app/contexts/IvritaContext';
```

### 2. Use the `t()` function

```tsx
function MyComponent() {
  const { t } = useIvrita();

  return (
    <div>
      {/* The text will be transformed based on user's gender */}
      <h1>{t('ברוך/ה הבא/ה')}</h1>
      <p>{t('את/ה רשום/ה לפעילות')}</p>
    </div>
  );
}
```

### 3. Ivrita Syntax

Ivrita uses special syntax to mark gender-inclusive text:

| Syntax | Male | Female | Neutral |
|--------|------|--------|---------|
| `ברוך/ה הבא/ה` | ברוך הבא | ברוכה הבאה | ברוכ/ה הבא/ה |
| `את/ה` | אתה | את | את/ה |
| `רשום/ה` | רשום | רשומה | רשומ/ה |

For more syntax examples, see the [Ivrita documentation](https://github.com/AlefAlefAlef/ivrita).

## Gender Values

The system supports these gender values (matching the Supabase enum):

| Database Value | Hebrew Display | Ivrita Mode |
|----------------|----------------|-------------|
| `male` | זכר | MALE |
| `female` | נקבה | FEMALE |
| `neutral` | ניטרלי | NEUTRAL |
| `prefer_not_to_say` | מעדיפ/ה לא לציין | ORIGINAL |
| `null` | (not selected) | ORIGINAL |

## Example Component

```tsx
'use client';

import { useIvrita } from '@/app/contexts/IvritaContext';

export default function WelcomeMessage() {
  const { t, gender } = useIvrita();

  return (
    <div>
      <h1>{t('שלום, ברוך/ה הבא/ה!')}</h1>
      <p>{t('את/ה כאן כדי להירשם לפעילויות')}</p>
      {gender && <small>מגדר נבחר: {gender}</small>}
    </div>
  );
}
```

## Context API

The `useIvrita()` hook provides:

```tsx
interface IvritaContextType {
  gender: GenderType;           // Current gender value
  setGender: (g: GenderType) => void;  // Update gender (usually not needed)
  t: (text: string) => string;  // Transform text based on gender
}

type GenderType = 'male' | 'female' | 'neutral' | 'prefer_not_to_say' | null;
```

## Notes

- The `t()` function safely handles empty strings and errors
- If no gender is selected, text remains unchanged (ORIGINAL mode)
- Gender syncs automatically when user profile loads
- The gender is set during signup in the wizard form
