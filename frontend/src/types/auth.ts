export interface User {
  id: number;
  email: string;
  name: string;
  type: "user" | "creator";
  verified: boolean;
  avatarUrl?: string;
  bio?: string;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  type: "user" | "creator";
}

export interface ProfileData {
  name?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
