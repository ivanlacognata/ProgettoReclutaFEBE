import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { supabase } from '../db/index.js';
import dotenv from 'dotenv';
dotenv.config();

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', jwt_payload.id)
      .single();

    if (error || !data) return done(null, false);
    return done(null, data);
  } catch (err) {
    return done(err, false);
  }
}));

export const authenticateJWT = passport.authenticate('jwt', { session: false });
