// src/auth/types.ts
export interface UserData {
  id: string;
  email: string;
  name: string;
  groups: string[];
}

export type AuthStatus = "checking" | "authenticated" | "unauthenticated";
