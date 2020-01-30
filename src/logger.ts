import winston, { format } from "winston";

// Setup Logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info"
});

logger.add(
  new winston.transports.Console({
    level: process.env.LOG_LEVEL || "info"
    // format: format.printf(info => info.message),
  })
);

if (process.env.LOGGER_URI) {
  logger.add(
    new winston.transports.Http({
      level: process.env.LOG_LEVEL!,
      host: process.env.LOG_URI!,
      port: process.env.LOG_PORT ? Number(process.env.LOG_PORT) : 80,
      path: process.env.LOG_PATH || "/",
      ssl: process.env.LOG_SSL ? true : false
    })
  );
}
