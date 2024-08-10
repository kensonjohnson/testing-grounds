import MagicLink from "passport-magic-link";
import { db } from "../../drizzle/db.js";
import { transporter } from "../mailtrap/transporter.js";
import type { Mail } from "mailtrap";
import {
  COOKIE_SECRET,
  BASE_URL,
  MAILTRAP_SENDER_EMAIL,
} from "../../constants.js";
import { eq } from "drizzle-orm";
import { UserTable } from "../../drizzle/schema.js";
import { pinoLogger } from "../../tools/logging.js";

export const MagicLinkStrategy = new MagicLink.Strategy(
  {
    secret: COOKIE_SECRET,
    userFields: ["email"],
    tokenField: "token",
    verifyUserAfterToken: true,
  },
  sendEmailToUser,
  verifyUser
);

function sendEmailToUser(user: Express.User, token: string) {
  const link = BASE_URL + "/auth/email/verify?token=" + token;
  const mail: Mail = {
    to: [{ email: user.email }],
    from: {
      name: "Testing Grounds",
      email: MAILTRAP_SENDER_EMAIL,
    },
    subject: "Sign in to Test Website",
    text:
      "Hello! Click the link below to finish signing in to Todos.\r\n\r\n" +
      link,
    html:
      '<h3>Hello!</h3><p>Click the link below to finish signing in to Todos.</p><p><a href="' +
      link +
      '">Sign in</a></p>',
  };
  return transporter.send(mail);
}

function verifyUser(verify: Express.User) {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      // Check for the user's email in the database
      const user = await db.query.UserTable.findFirst({
        where: eq(UserTable.email, verify.email),
      });

      if (user) {
        return resolve(user);
      }

      // If no user found, create one
      const [newUser] = await db
        .insert(UserTable)
        .values({ email: verify.email, email_verified: true })
        .returning();

      if (!newUser) throw new Error("Failed to create user");

      return resolve(newUser);
    } catch (error) {
      pinoLogger.error(error);
      return reject(error);
    }
  });
}
