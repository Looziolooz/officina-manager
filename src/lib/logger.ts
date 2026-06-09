type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  meta?: Record<string, unknown>;
  timestamp: string;
}

function createLogger() {
  const isProduction = process.env.NODE_ENV === "production";

  function shouldLog(level: LogLevel): boolean {
    if (!isProduction) return true;
    return level === "warn" || level === "error";
  }

  function formatMessage(entry: LogEntry): string {
    const metaStr = entry.meta ? ` ${JSON.stringify(entry.meta)}` : "";
    return `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}${metaStr}`;
  }

  function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
    if (!shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      meta,
      timestamp: new Date().toISOString(),
    };

    const formatted = formatMessage(entry);

    switch (level) {
      case "debug":
        if (!isProduction) console.debug(formatted);
        break;
      case "info":
        if (!isProduction) console.info(formatted);
        break;
      case "warn":
        console.warn(formatted);
        break;
      case "error":
        console.error(formatted);
        break;
    }
  }

  return {
    debug: (msg: string, meta?: Record<string, unknown>) => log("debug", msg, meta),
    info: (msg: string, meta?: Record<string, unknown>) => log("info", msg, meta),
    warn: (msg: string, meta?: Record<string, unknown>) => log("warn", msg, meta),
    error: (msg: string, meta?: Record<string, unknown>) => log("error", msg, meta),
  };
}

export const logger = createLogger();
