import assert from "assert";
import { config } from "dotenv";
config();

assert(process.env.BASE_URL, "Environment variable BASE_URL must be set!");
export const BASE_URL = process.env.BASE_URL;
export const PORT = process.env.PORT || 3000;

assert(
  process.env.MAILTRAP_ENDPOINT,
  "Environment variable MAILTRAP_ENDPOINT must be set!"
);
assert(
  process.env.MAILTRAP_API_KEY,
  "Environment variable MAILTRAP_API_KEY must be set!"
);
export const MAILTRAP_CONFIG = {
  endpoint: process.env.MAILTRAP_ENDPOINT,
  token: process.env.MAILTRAP_API_KEY,
};

assert(
  process.env.MAILTRAP_SENDER_EMAIL,
  "Environment variable MAILTRAP_SENDER_EMAIL must be set!"
);
export const MAILTRAP_SENDER_EMAIL = process.env.MAILTRAP_SENDER_EMAIL;

assert(
  process.env.DATABASE_URL,
  "Environment variable DATABASE_URL must be set!"
);
export const DB_CONFIG = {
  connectionString: process.env.DATABASE_URL,
};

assert(
  process.env.COOKIE_SECRET,
  "Environment variable COOKIE_SECRET must be set!"
);
export const COOKIE_SECRET = process.env.COOKIE_SECRET;

assert(
  process.env.OPENAI_API_KEY,
  "Environment variable OPENAI_API_KEY must be set!"
);
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

assert(
  process.env.STRIPE_PUBLISHABLE_KEY,
  "Environment variable STRIPE_PUBLISHABLE_KEY must be set!"
);
export const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;

assert(
  process.env.STRIPE_SECRET_KEY,
  "Environment variable STRIPE_SECRET_KEY must be set!"
);
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

assert(
  process.env.STRIPE_WEBHOOK_SECRET,
  "Environment variable STRIPE_WEBHOOK_SECRET must be set!"
);
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
