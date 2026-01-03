declare module 'ivrita/src/ivrita' {
  export const ORIGINAL: number;
  export const MALE: number;
  export const FEMALE: number;
  export const NEUTRAL: number;
  export const GENDERS: number[];
  export function genderize(text: string, gender: number, doneFunc?: (used: RegExp[]) => void): string;
}
