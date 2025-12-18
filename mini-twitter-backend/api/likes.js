import express from 'express';
import { supabase } from '../db/index.js';
import passport from '../middleware/auth.js';

const router = express.Router();

/* =====================================================
   AGGIUNGI UN LIKE
   ===================================================== */
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { post_id } = req.body;
    const user = req.user;

    if (!post_id) return res.status(400).json({ error: 'post_id mancante' });

    // controlla se il like esiste già
    const { data: existing } = await supabase
      .from('likes')
      .select('*')
      .eq('post_id', post_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ error: 'Hai già messo like a questo post' });
    }

    const { data, error } = await supabase
      .from('likes')
      .insert([{ post_id, user_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Errore durante il like' });
    }

    res.status(201).json({ message: 'Like aggiunto!', like: data });
  }
);

/* =====================================================
   RIMUOVI UN LIKE
   ===================================================== */

// DELETE /likes/:postId  → unlike
router.delete(
  "/:postId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { postId } = req.params;
    const userId = req.user.id;

    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId);

    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Errore rimuovendo il like" });
    }

    return res.json({ message: "Like rimosso" });
  }
);


/* =====================================================
   CONTA I LIKE DI UN POST
   ===================================================== */
router.get('/:post_id/count', async (req, res) => {
  const { post_id } = req.params;
  try {
    const { data, error } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', post_id);

    if (error) throw error;

    res.set('Cache-Control', 'no-store');

    res.json({ likes: data.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel conteggio dei like' });
  }
});


//Controlla se l’utente loggato ha messo like a un post
router.get(
  '/:postId/me',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { postId } = req.params;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Errore DB' });
    }

    res.json({ liked: !!data });
  }
);


// ===============================
// GET /likes/:postId/me
// Ritorna se l’utente loggato ha messo like al post
// ===============================

router.get(
  '/:postId/me',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { postId } = req.params;
    const userId = req.user.id;

    if (!postId) {
      return res.status(400).json({ error: 'postId mancante' });
    }

    const { data, error } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Errore database' });
    }

    return res.json({
      liked: !!data
    });
  }
);


/* =====================================================
   LIKE DI UN UTENTE
   ===================================================== */
router.get('/user/:user_id', async (req, res) => {
  const { user_id } = req.params;

  const { data, error } = await supabase
    .from('likes')
    .select(`
      id,
      created_at,
      post_id,
      posts (
        id,
        content,
        created_at,
        user_id,
        users ( username )
      )
    `)
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Errore caricamento like utente' });
  }

  res.json({ items: data });
});



export default router;
