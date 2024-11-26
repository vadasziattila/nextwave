import axios from "@/lib/api";

/**
 * Fetch CSRF token from Sanctum.
 */
export const getCsrfToken = async (): Promise<void> => {
  try {
    await axios.get("/csrf-cookie");
  } catch (error: any) {
    console.error(`Error fetching CSRF token: ${error}`);
    throw new Error("Could not fetch CSRF token.");
  }
};

/**
 * Login with optional 2FA. If 2FA is required, a session ID will be returned.
 */
export const login = async (
  email: string,
  password: string,
  twoFactorCode?: number | string, // Allow both number and string for OTP
  twoFactorRecoveryCode?: string
) => {
  try {
    const response = await axios.post("/login", {
      email,
      password,
      two_factor_code: twoFactorCode, // Pass OTP as optional
      two_factor_recovery_codes: twoFactorRecoveryCode, // Pass recovery code as optional
    });

    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

/**
 * Verify the 2FA code or recovery code.
 */
export const verifyTwoFactor = async (
  sessionId: string,
  twoFactorCode?: number,
  twoFactorRecoveryCode?: string
): Promise<{ message: string; token: string }> => {
  try {
    const response = await axios.post("/two-factor/verify", {
      session_id: sessionId,
      two_factor_code: twoFactorCode,
      two_factor_recovery_code: twoFactorRecoveryCode,
    });

    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

/**
 * Enable Two-Factor Authentication.
 */
export const enableTwoFactorAuthentication = async (): Promise<{
  message: string;
  qr_code_url: string;
  manual_entry_key: string;
  recovery_codes: string[];
}> => {
  try {
    const response = await axios.post("/two-factor/enable");
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

/**
 * Disable Two-Factor Authentication.
 */
export const disableTwoFactorAuthentication = async (): Promise<{
  message: string;
}> => {
  try {
    const response = await axios.post("/two-factor/disable");
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

/**
 * Regenerate recovery codes for Two-Factor Authentication.
 */
export const regenerateRecoveryCodes = async (): Promise<{
  message: string;
  two_factor_recovery_codes: string[];
}> => {
  try {
    const response = await axios.post("/two-factor/regenerate-recovery-codes");
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

/**
 * Reset Two-Factor Authentication for a specific user (Admin Action).
 */
export const resetTwoFactorAuthentication = async (
  userId: number
): Promise<{ message: string }> => {
  try {
    const response = await axios.post(`/two-factor/reset-two-factor/${userId}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};
