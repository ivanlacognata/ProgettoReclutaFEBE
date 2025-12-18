import express from 'express';
import { supabase } from '../db/index.js';
import passport from '../middleware/auth.js';

const router = express.Router();

/* =====================================================
   CREA UN POST
   ===================================================== */
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { content } = req.body;
    const user = req.user;

    if (!content) {
      return res.status(400).json({ error: 'Contenuto mancante' });
    }

    const { data, error } = await supabase
      .from('posts')
      .insert([{ user_id: user.id, content }])
      .select('id, user_id, content, created_at')
      .single();

    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Errore creazione post' });
    }

    res.status(201).json({ post: data });
  }
);

/* =====================================================
   LEGGI POST (TUTTI o PER UTENTE)
   ===================================================== */
router.get('/', async (req, res) => {
  const { user_id } = req.query;

  let query = supabase
    .from('posts')
    .select(
      `
      id,
      user_id,
      content,
      created_at,
      users (
        id,
        username
      )
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false });

  if (user_id) {
    query = query.eq('user_id', user_id);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Errore caricamento post' });
  }

  res.json({
    items: data,
    total: count ?? data.length,
  });
});

/* =====================================================
   LEGGI POST PER ID
   ===================================================== */
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('posts')
    .select(
      `
      id,
      user_id,
      content,
      created_at,
      users (
        id,
        username
      )
    `
    )
    .eq('id', id)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'Post non trovato' });
  }

  res.json(data);
});

/* =====================================================
   MODIFICA POST
   ===================================================== */
router.patch(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    const user = req.user;

    if (!content) {
      return res.status(400).json({ error: 'Contenuto mancante' });
    }

    const { data: existing } = await supabase
      .from('posts')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (!existing) {
      return res.status(404).json({ error: 'Post non trovato' });
    }

    if (existing.user_id !== user.id) {
      return res.status(403).json({ error: 'Non autorizzato' });
    }

    const { data, error } = await supabase
      .from('posts')
      .update({ content })
      .eq('id', id)
      .select('id, user_id, content, created_at')
      .single();

    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Errore aggiornamento post' });
    }

    res.json({ post: data });
  }
);

/* =====================================================
   ELIMINA POST
   ===================================================== */
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { id } = req.params;
    const user = req.user;

    const { data: existing } = await supabase
      .from('posts')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (!existing) {
      return res.status(404).json({ error: 'Post non trovato' });
    }

    if (existing.user_id !== user.id) {
      return res.status(403).json({ error: 'Non autorizzato' });
    }

    const { error } = await supabase.from('posts').delete().eq('id', id);

    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Errore eliminazione post' });
    }

    res.json({ message: 'Post eliminato' });
  }
);

export default router;
