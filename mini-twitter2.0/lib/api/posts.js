import { fetchClient } from "@/lib/fetchClient";

/* GET Posts */
export async function getPosts(params = {}) {
  const query = new URLSearchParams();

  if (params.limit) query.append("limit", params.limit.toString());
  if (params.offset) query.append("offset", params.offset.toString());
  if (params.user_id) query.append("user_id", params.user_id);

  const path = "/posts" + (query.toString() ? `?${query.toString()}` : "");

  const data = await fetchClient({
    path,
    method: "GET",
    auth: false,
  });

  return data;
}




/* CREA UN NUOVO POST */
export async function createPost(content) {
  if (!content) {
    throw new Error("Il contenuto del post è obbligatorio");
  }

  try {
    const data = await fetchClient({
      path: "/posts",
      method: "POST",
      body: { content },
      auth: true
    });

    return data;
  } catch (err) {
    if (err.status === 400)
      throw new Error(err.body?.error || "Campi mancanti o non validi");

    if (err.status === 401)
      throw new Error("Non autenticato");

    if (err.status === 500)
      throw new Error("Errore interno del server");

    throw new Error("Errore di rete o risposta non valida");
  }
}

/* RECUPERA UN POST PER ID */
export async function getPostById(id) {
  if (!id) throw new Error("ID post richiesto");

  try {
    const data = await fetchClient({
      path: `/posts/${id}`,
      method: "GET",
    });
    const normalized = {
      ...data,
      username: data.username || data.users?.username || 'Utente',
    };

    return normalized;
  } catch (err) {
    if (err.status === 404) throw new Error("Post non trovato");
    if (err.status === 500) throw new Error("Errore interno del server");
    throw new Error("Errore di rete o risposta non valida");
  }
}



/* AGGIORNA PARZIALMENTE UN POST */
export async function updatePost(id, updateData) {
  if (!id) throw new Error("ID del post richiesto");
  if (!updateData || typeof updateData !== "object")
    throw new Error("Dati aggiornamento mancanti o invalidi");

  try {
    const data = await fetchClient({
      path: `/posts/${id}`,
      method: "PATCH",
      body: updateData,
      auth: true,
    });

    return data;

  } catch (err) {
    if (err.status === 400)
      throw new Error("Payload non valido o nessun campo da aggiornare");

    if (err.status === 401)
      throw new Error("Non autenticato");

    if (err.status === 403)
      throw new Error("Non puoi modificare questo post");

    if (err.status === 404)
      throw new Error("Post non trovato");

    if (err.status === 500)
      throw new Error("Errore interno del server");

    throw new Error("Errore di rete o risposta non valida");
  }
}

/* ELIMINA UN POST */
export async function deletePost(id) {
  if (!id) throw new Error("ID del post richiesto");

  try {
    await fetchClient({
      path: `/posts/${id}`,
      method: "DELETE",
      auth: true,
    });

    return true;

  } catch (err) {
    if (err.status === 401)
      throw new Error("Non autenticato");

    if (err.status === 403)
      throw new Error("Non puoi eliminare questo post");

    if (err.status === 404)
      throw new Error("Post non trovato");

    if (err.status === 500)
      throw new Error("Errore interno del server");

    throw new Error("Errore di rete o risposta non valida");
  }
}
