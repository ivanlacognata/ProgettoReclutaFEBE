import { fetchClient } from "@/lib/fetchClient";

/* ===============================
   GET Likes count per post
   =============================== */
export async function getLikes(postId) {
  if (!postId || typeof postId !== "string") {
    console.error("❌ post_id non valido in getLikes:", postId);
    return 0;
  }

  try {
    const data = await fetchClient({
      path: `/likes/${postId}/count`,
      method: "GET",
      auth: false,
    });

    return data?.likes ?? 0;
  } catch (err) {
    console.error("❌ Errore getLikes:", err);
    return 0;
  }
}

/* ===============================
   CREA Like
   =============================== */
export async function createLike(postId) {
  if (!postId) throw new Error("post_id mancante");

  return await fetchClient({
    path: "/likes",
    method: "POST",
    body: { post_id: postId },
    auth: true,
  });
}

/* ===============================
   RIMUOVE Like
   =============================== */
export async function deleteLike(postId) {
  if (!postId) throw new Error("post_id è obbligatorio");

  await fetchClient({
    path: `/likes/${postId}`,
    method: "DELETE",
    auth: true,
  });

  return true;
}

/* ===============================
   VERIFICA SE L’UTENTE HA MESSO LIKE
   =============================== */
export async function getMyLike(postId) {
  if (!postId || typeof postId !== "string") return false;

  try {
    const data = await fetchClient({
      path: `/likes/${postId}/me`,
      method: "GET",
      auth: true,
    });

    return data?.liked === true;
  } catch (err) {
    console.error("[getMyLike] errore:", err);
    return false;
  }
}

export async function getLikesByUser(userId) {
  return fetchClient({
    path: `/likes/user/${userId}`,
    method: 'GET',
    auth: false,
  });
}
