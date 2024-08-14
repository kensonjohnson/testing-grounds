import { DefaultLogger, type LogWriter } from "drizzle-orm/logger";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.js";
import pg from "pg";
import { DB_CONFIG } from "../constants.js";
import { pinoLogger } from "../tools/logging.js";

const { Pool } = pg;

export const pool = new Pool(DB_CONFIG);

let logger: boolean | DefaultLogger = false;

if (process.env.NODE_ENV === "development") {
  class PinoLogWriter implements LogWriter {
    write(message: string) {
      pinoLogger.info(message);
    }
  }
  logger = new DefaultLogger({ writer: new PinoLogWriter() });
}

export const db = drizzle(pool, { schema, logger });
