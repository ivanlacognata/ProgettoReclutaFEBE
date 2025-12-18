import { fetchClient } from "@/lib/fetchClient";

/* ===============================
   GET Comments (di un post)
   =============================== */
export async function getComments(params = {}) {
  try {
    if (params.post_id) {
      const data = await fetchClient({
        path: `/comments/${params.post_id}`,
        method: "GET",
        auth: false,
      });

      const list = Array.isArray(data?.comments) ? data.comments : [];
      return { items: list, total: list.length };
    }

    return { items: [], total: 0 };
  } catch (err) {
    throw new Error(err?.body?.error || "Errore di rete o risposta non valida");
  }
}

/* ===============================
   CREATE Comment
   =============================== */
export async function createComment(postId, content) {
  if (!postId || !content) {
    throw new Error('Dati mancanti');
  }

  return fetchClient({
    path: '/comments',
    method: 'POST',
    body: {
      post_id: postId,   
      content,           
    },
    auth: true,
  });
}


export async function getCommentsByUser(userId) {
  return fetchClient({
    path: `/comments/user/${userId}`,
    method: 'GET',
    auth: false,
  });
}


export async function updateComment(id, payload) {
  if (!id) throw new Error("ID commento mancante");

  return await fetchClient({
    path: `/comments/${id}`,
    method: "PATCH",
    body: payload,
    auth: true,
  });
}

export async function deleteComment(id) {
  if (!id) throw new Error("ID commento mancante");

  return await fetchClient({
    path: `/comments/${id}`,
    method: "DELETE",
    auth: true,
  });
}

