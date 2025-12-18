
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import { supabase } from '../db/index.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

/* =====================================================
   REGISTRAZIONE
   ===================================================== */
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Verifica dati base
  if (!username || !email || !password)
    return res.status(400).json({ error: 'Dati mancanti' });

  // Controllo se esiste già un utente con stesso username o email
  const { data: existing, error: existingError } = await supabase
    .from('users')
    .select('*')
    .or(`username.eq.${username},email.eq.${email}`)
    .maybeSingle();

  if (existingError) {
    console.error(existingError);
    return res.status(500).json({ error: 'Errore nel database' });
  }

  if (existing)
    return res.status(400).json({ error: 'Utente già esistente' });

  // Cripta la password
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  // Genera secret OTP (per la 2FA)
  const otp_secret = speakeasy.generateSecret().base32;

  // Salva utente nel DB
  const { data, error } = await supabase
    .from('users')
    .insert([{ username, email, password_hash, otp_secret, otp_enabled: false }])
    .select()
    .single();

  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Errore nel salvataggio utente' });
  }

  // Genera token JWT
  const token = jwt.sign(
    { id: data.id, username: data.username },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.status(201).json({
    message: 'Registrazione riuscita!',
    user: data,
    token
  });
});

/* =====================================================
   LOGIN CON USERNAME + OTP OBBLIGATORIO
   ===================================================== */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Controllo input
  if (!username || !password) {
    return res.status(400).json({ error: 'Dati mancanti' });
  }

  // Cerca utente per username
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .maybeSingle();

  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Errore nel database' });
  }

  if (!user) {
    return res.status(401).json({ error: 'Utente non trovato' });
  }

  // Verifica password
  const passwordOk = await bcrypt.compare(password, user.password_hash);
  if (!passwordOk) {
    return res.status(401).json({ error: 'Password errata' });
  }

  /* =====================================================
    LOGICA OTP
     ===================================================== */

  //SE OTP SECRET ESISTE → RICHIEDI SEMPRE OTP
if (user.otp_secret) {
  const tempToken = jwt.sign(
    { id: user.id, type: 'temp' },
    process.env.JWT_SECRET,
    { expiresIn: '5m' }
  );

  return res.json({
    requires_otp: true,
    temp_token: tempToken
  });
}


  // OTP ATTIVO → STEP 2 (codice OTP)
  if (user.otp_enabled) {
    const tempToken = jwt.sign(
      { id: user.id, type: 'temp' },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }
    );

    return res.json({
      requires_otp: true,
      temp_token: tempToken
    });
  }

  // LOGIN DIRETTO 
  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.json({
    message: 'Login riuscito!',
    user: {
      id: user.id,
      username: user.username,
      email: user.email
    },
    token
  });
});


/* =====================================================
   VERIFICA OTP
   ===================================================== */
router.post('/verify-otp', async (req, res) => {
  const { temp_token, otp_code } = req.body;
  if (!temp_token || !otp_code)
    return res.status(400).json({ error: 'Dati mancanti' });

  try {
    // Decodifica il token temporaneo
    const decoded = jwt.verify(temp_token, process.env.JWT_SECRET);
    if (decoded.type !== 'temp')
      return res.status(400).json({ error: 'Token non valido' });

    // Recupera utente
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.id)
      .maybeSingle();

    if (error || !user)
      return res.status(401).json({ error: 'Utente non trovato' });

    // Verifica OTP
const verified = speakeasy.totp.verify({
  secret: user.otp_secret,
  encoding: 'base32',
  token: otp_code
});

if (!verified)
  return res.status(401).json({ error: 'Codice OTP non valido' });

// ABILITA OTP PER L’UTENTE
await supabase
  .from('users')
  .update({ otp_enabled: true })
  .eq('id', user.id);

// JWT DEFINITIVO
const token = jwt.sign(
  { id: user.id, username: user.username },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

res.json({
  message: 'OTP verificato con successo!',
  token
});


  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: 'Token scaduto o non valido' });
  }
});

/* =====================================================
   /ME → ritorna info utente loggato (JWT)
   ===================================================== */
import passport from '../middleware/auth.js';

router.get(
  '/me',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const user = req.user;
    res.json({
      message: 'Utente autenticato',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  }
);

// --- OTP SETUP (ritorna otpauth_url e secret) ---

router.get(
  '/otp/setup',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const user = req.user; // { id, email, username, otp_secret, ... }

      if (!user?.otp_secret) {
        return res.status(400).json({ error: 'OTP non inizializzato per questo utente' });
      }

      const issuer = 'Jetop';
      const account = user.email || user.username || 'user';

      // Costruisce un otpauth URL PERFETTO per Google Authenticator / Aegis
      const otpauth_url = speakeasy.otpauthURL({
        secret: user.otp_secret,
        label: `${issuer}:${account}`,
        issuer,
        encoding: 'base32',
      });

      return res.json({
        secret: user.otp_secret,
        otpauth_url,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Errore generazione OTP URL' });
    }
  }
);

export default router;
