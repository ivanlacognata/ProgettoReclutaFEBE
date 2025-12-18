const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export async function fetchClient({ path, method = "GET", body, auth = false }) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const url = API_BASE + path;
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });


  // Gestione speciale per risposte senza corpo (es. 204 o 304)
  let text;
  try {
    text = await res.text();
  } catch (e) {
    text = "";
  }

  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    console.warn("⚠️ Risposta non in formato JSON:", text);
    data = {};
  }

  if (res.status === 401) {
    console.warn("Token scaduto o non valido. Logout automatico.");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    return;
  }

  if (!res.ok) {
    throw {
      status: res.status,
      body: data,
      message: data?.error || "Errore API",
    };
  }

  return data;
}
