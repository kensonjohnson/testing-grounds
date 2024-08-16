import { pinoHttp, type Options } from "pino-http";
import { pino, type Logger } from "pino";

// Use existing logger
const options: Options = {};

console.log("NODE_ENV", process.env.NODE_ENV === "development");

if (process.env.NODE_ENV === "development") {
  options.transport = { target: "pino-pretty" };
  // Logging is way too verbose with the defaults,
  // so trim it back when in development.
  options.autoLogging = false;
  options.serializers = {
    req: (req) => {
      return `${req.method}: ${req.url}`;
    },
    res: (res) => `${res.statusCode}`,
    err: pino.stdSerializers.err,
  };
}

export const httpLogger = pinoHttp(options);

export const pinoLogger = pino({
  transport: { target: "pino-pretty" },
}) as Logger;
