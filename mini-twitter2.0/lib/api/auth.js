import { fetchClient } from "@/lib/fetchClient";

/* REGISTRAZIONE */
export async function registerUser(payload) {
  try {
    const res = await fetchClient({
      path: "/auth/register",
      method: "POST",
      body: payload, 
    });
    return res;
  } catch (err) {
    throw new Error(err?.body?.error || "Errore durante la registrazione");
  }
}

/* LOGIN */
export async function loginUser(payload) {
  try {

    const res = await fetchClient({
      path: "/auth/login",
      method: "POST",
      body: payload,
    });

    return res;

  } catch (err) {
    console.error("❌ Errore loginUser:", err);
    throw new Error(err?.body?.error || err?.message || "Errore durante il login");
  }
}


/* VERIFICA OTP */
export async function verifyOtp(payload) {
  try {
    const res = await fetchClient({
      path: "/auth/verify-otp",
      method: "POST",
      body: payload,
    });
    return res;
  } catch (err) {
    throw new Error(err?.body?.error || "OTP non valido");
  }
}

/* LOGOUT */
export async function logoutUser() {
  try {
    return await fetchClient({
      path: "/auth/logout",
      method: "POST",
      auth: true,
    });
  } catch (err) {
    throw new Error("Errore durante il logout");
  }
}

/* DATI UTENTE LOGGATO */
export async function getMe() {
  try {
    return await fetchClient({
      path: "/auth/me",
      method: "GET",
      auth: true,
    });
  } catch (err) {
    throw new Error("Non autenticato");
  }
}

/* OTTIENI SECRET + URL QR PER OTP */
export async function setupOtp() {
  try {
    return await fetchClient({
      path: "/auth/otp/setup",
      method: "GET",
      auth: true,
    });
  } catch (err) {
    throw new Error("Errore ottenendo il QR Code OTP");
  }
}

/* STATO OTP DELL’UTENTE */
export async function getOtpStatus() {
  try {
    return await fetchClient({
      path: "/auth/otp/status",
      method: "GET",
      auth: true,
    });
  } catch (err) {
    throw new Error("Errore recupero stato OTP");
  }
}
