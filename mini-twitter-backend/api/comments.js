import express from 'express';
import { supabase } from '../db/index.js';
import passport from '../middleware/auth.js';

const router = express.Router();

/* =====================================================
   CREA UN COMMENTO
   ===================================================== */
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { post_id, content } = req.body;
    const user = req.user;

    if (!post_id || !content)
      return res.status(400).json({ error: 'Dati mancanti' });

    const { data, error } = await supabase
      .from('comments')
      .insert([{ post_id, user_id: user.id, content }])
      .select()
      .single();

    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Errore nella creazione del commento' });
    }

    res.status(201).json({ message: 'Commento creato!', comment: data });
  }
);

/* =====================================================
   LEGGI I COMMENTI DI UN POST
   ===================================================== */
router.get('/:post_id', async (req, res) => {
  const { post_id } = req.params;

  const { data, error } = await supabase
    .from('comments')
    .select(`
      id,
      content,
      created_at,
      users ( id, username )
    `)
    .eq('post_id', post_id)
    .order('created_at', { ascending: true });

  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Errore nel caricamento dei commenti' });
  }

  res.json({ comments: data });
});

/* =====================================================
    MODIFICA UN COMMENTO
   ===================================================== */
router.patch(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    const user = req.user;

    const { data: existing } = await supabase
      .from('comments')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!existing)
      return res.status(404).json({ error: 'Commento non trovato' });

    if (existing.user_id !== user.id)
      return res.status(403).json({ error: 'Non puoi modificare commenti di altri utenti' });

    const { data, error } = await supabase
      .from('comments')
      .update({ content })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Errore durante l’aggiornamento del commento' });
    }

    res.json({ message: 'Commento aggiornato!', comment: data });
  }
);

/* =====================================================
   ELIMINA UN COMMENTO
   ===================================================== */
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { id } = req.params;
    const user = req.user;

    const { data: existing } = await supabase
      .from('comments')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!existing)
      return res.status(404).json({ error: 'Commento non trovato' });

    if (existing.user_id !== user.id)
      return res.status(403).json({ error: 'Non puoi eliminare commenti di altri utenti' });

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Errore durante la cancellazione del commento' });
    }

    res.json({ message: 'Commento eliminato correttamente' });
  }
);

/* =====================================================
   LEGGI I COMMENTI
   ===================================================== */
router.get('/', async (req, res) => {
  const { post_id } = req.query;

  if (!post_id) {
    return res.json({ items: [] });
  }

  const { data, error } = await supabase
    .from('comments')
    .select(`
      id,
      content,
      created_at,
      user_id,
      users ( id, username )
    `)
    .eq('post_id', post_id)
    .order('created_at', { ascending: true });

  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Errore nel caricamento dei commenti' });
  }

  res.json({
    items: data,
    total: data.length,
  });
});

/* =====================================================
   COMMENTI SCRITTI DA UN UTENTE
   ===================================================== */
router.get('/user/:user_id', async (req, res) => {
  const { user_id } = req.params;

  const { data, error } = await supabase
    .from('comments')
    .select(`
      id,
      content,
      created_at,
      post_id,
      users ( id, username )
    `)
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Errore caricamento commenti utente' });
  }

  res.json({ items: data });
});



export default router;
