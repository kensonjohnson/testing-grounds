import type { Express } from "express";
import { MagicLinkStrategy } from "./magic-link.js";
import session from "express-session";
import connectPG from "connect-pg-simple";
import { pool as pgPool } from "../../drizzle/db.js";
import passport from "passport";
import { COOKIE_SECRET } from "../../constants.js";

export function configurePassport(app: Express) {
  // Create session store
  const pgSession = connectPG(session);

  app.use(
    session({
      store: new pgSession({
        pool: pgPool,
      }),
      secret: COOKIE_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 Day expiration
    })
  );

  app.use(passport.authenticate("session"));

  // Add Strategies
  passport.use(MagicLinkStrategy);

  // Serialize and Deserialize
  passport.serializeUser((user, cb) => {
    // The user recieved here is the entire row from the 'users' table in
    // the database, so this will match the structure defined in 'init.sql'.
    process.nextTick(() => {
      cb(null, user);
    });
  });

  passport.deserializeUser((user, cb) => {
    process.nextTick(() => {
      return cb(null, user as Express.User);
    });
  });
}
