export interface AuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  isOnboarded: boolean;
}

export interface SignUpData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface UserProfile {
  age: number;
  occupation: string;
  annualIncome: number;
  city: string;
  education: string;
  category: string;
} 