import { fetchClient } from "@/lib/fetchClient";

/* GET Users */
export async function getUsers(params = {}) {
  const query = new URLSearchParams();
  if (params.limit) query.append("limit", params.limit.toString());
  if (params.offset) query.append("offset", params.offset.toString());
  if (params.q) query.append("q", params.q);

  const path = "/users" + (query.toString() ? `?${query.toString()}` : "");

  try {
    const data = await fetchClient({
      path,
      method: "GET",
      auth: false,
    });
    return data;
  } catch (err) {
    if (err.status === 400) throw new Error(err.body?.error || "Parametri non validi");
    if (err.status === 500) throw new Error("Errore interno del server");
    throw new Error("Errore di rete o risposta non valida");
  }
}

/* POST Users */
export async function createUser(userData) {
  try {
    const data = await fetchClient({
      path: "/users",
      method: "POST",
      body: userData,
      auth: false
    });
    return data;
  } catch (err) {
    if (err.status === 400) throw new Error(err.body?.error || "Campi mancanti o non validi");
    if (err.status === 500) throw new Error("Errore interno del server");
    throw new Error("Errore di rete o risposta non valida");
  }
}

/* GET User by ID */
export async function getUserById(id) {
  if (!id || typeof id !== "string") throw new Error("ID utente richiesto");

  try {
    const data = await fetchClient({
      path: `/users/${id}`,
      method: "GET",
      auth: false, 
    });

    return data?.user ?? data;
  } catch (err) {
    if (err.status === 404) throw new Error("Utente non trovato");
    if (err.status === 401) throw new Error("Non autorizzato");
    if (err.status === 500) throw new Error("Errore interno del server");
    throw new Error(err?.body?.error || "Errore di rete o risposta non valida");
  }
}


/* PATCH User */
export async function updateUser(id, updateData) {
  if (!id) throw new Error("ID utente richiesto");

  try {
    const data = await fetchClient({
      path: `/users/${id}`,
      method: "PATCH",
      body: updateData,
      auth: true,
    });
    return data;
  } catch (err) {
    if (err.status === 400) throw new Error(err.body?.error || "Payload non valido");
    if (err.status === 404) throw new Error("Utente non trovato");
    if (err.status === 500) throw new Error("Errore interno del server");
    throw new Error("Errore di rete o risposta non valida");
  }
}

/* DELETE User */
export async function deleteUser(id) {
  if (!id) throw new Error("ID utente richiesto");

  try {
    await fetchClient({
      path: `/users/${id}`,
      method: "DELETE",
      auth: true,
    });
  } catch (err) {
    if (err.status === 404) throw new Error("Utente non trovato");
    if (err.status === 500) throw new Error("Errore interno del server");
    throw new Error("Errore di rete o risposta non valida");
  }
}
