
// ---------- USER ----------
export interface User {
  id: number;
  username: string;
  email: string;
  has_otp?: boolean; 
  bio?: string;      
}

// ---------- REGISTER ----------
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
  otp_secret?: string;
}

// ---------- LOGIN ----------
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;       
  requires_otp?: boolean; 
  tmp_token?: string;    
  user: User;
}

// ---------- VERIFY OTP ----------
export interface VerifyOtpRequest {
  temp_token: string;
  otp_token: string; 
}

export interface VerifyOtpResponse {
  success: boolean;
  token: string; 
  user: User;
}

// ---------- LOGOUT ----------
export interface LogoutResponse {
  success: boolean;
  message: string;
}

// ---------- OTP SETUP ----------
export interface OtpSetupResponse {
  secret: string;
  otpauth_url: string;
}

// ---------- OTP STATUS ----------
export interface OtpStatusResponse {
  has_otp: boolean;
  message: string;
}

// ---------- ERROR ----------
export interface ErrorResponse {
  error: string;
}
