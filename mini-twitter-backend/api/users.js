import express from 'express';
import { supabase } from '../db/index.js';
import passport from '../middleware/auth.js';

const router = express.Router();

/* ============ GET utente loggato ============ */
// GET /api/users/me
router.get(
  '/me',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    return res.json({ user: req.user });
  }
);

/* =====================================================
   LISTA UTENTI (protetta)
   ===================================================== */
// GET /api/users?page=1&limit=10
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const page = Math.max(parseInt(req.query.page || '1', 10), 1);
      const limit = Math.max(parseInt(req.query.limit || '10', 10), 1);
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from('users')
        .select('id, username, email, created_at', { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Errore nel caricamento utenti' });
      }

      return res.json({
        page,
        limit,
        total: count ?? 0,
        users: data,
      });
    } catch (err) {
      console.error('Errore GET /users', err);
      return res.status(500).json({ error: 'Errore interno del server' });
    }
  }
);

/* ============ DETTAGLIO UTENTE ============ */
// GET /api/users/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('users')
    .select('id, username, email, bio, created_at')
    .eq('id', id)
    .single();

  if (error) {
    console.error('🔥 Supabase error GET /users/:id →', error);
    return res.status(500).json({ error: error.message });
  }

  if (!data) {
    return res.status(404).json({ error: 'Utente non trovato' });
  }

  res.json(data);
});


/* =====================================================
   UPDATE PROFILO (solo se stesso)
   ===================================================== */
// PATCH /api/users/:id
router.patch(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { id } = req.params;
    const me = req.user;

    try {
      if (me.id !== id) {
        return res.status(403).json({ error: 'Non puoi modificare altri utenti' });
      }

      const { username, bio, email } = req.body || {};
      const payload = {};

      if (username) payload.username = username;
      if (bio !== undefined) payload.bio = bio; 
      if (email) payload.email = email;

      if (Object.keys(payload).length === 0) {
        return res.status(400).json({ error: 'Nessun campo da aggiornare' });
      }

      const { data, error } = await supabase
        .from('users')
        .update(payload)
        .eq('id', id)
        .select('id, username, email, bio, created_at')
        .single();

      if (error) {
        console.error(error);
        return res.status(400).json({ error: 'Aggiornamento non valido' });
      }

      return res.json({ message: 'Profilo aggiornato', user: data });
    } catch (err) {
      console.error('Errore PATCH /users/:id', err);
      return res.status(500).json({ error: 'Errore interno del server' });
    }
  }
);

/* =====================================================
   DELETE ACCOUNT
   ===================================================== */
// DELETE /api/users/:id
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { id } = req.params;
    const me = req.user;

    try {
      if (me.id !== id) {
        return res.status(403).json({ error: 'Non puoi eliminare altri utenti' });
      }

      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Errore nella cancellazione utente' });
      }

      return res.json({ message: 'Account eliminato' });
    } catch (err) {
      console.error('Errore DELETE /users/:id', err);
      return res.status(500).json({ error: 'Errore interno del server' });
    }
  }
);

export default router;
