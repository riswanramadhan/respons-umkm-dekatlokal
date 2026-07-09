import "server-only";

type LogLevel = "info" | "warn" | "error";

function write(
  level: LogLevel,
  event: string,
  context: Record<string, unknown> = {},
) {
  const payload = JSON.stringify({
    level,
    event,
    timestamp: new Date().toISOString(),
    ...context,
  });
  if (level === "error") console.error(payload);
  else if (level === "warn") console.warn(payload);
  else console.info(payload);
}

export const logger = {
  info: (event: string, context?: Record<string, unknown>) =>
    write("info", event, context),
  warn: (event: string, context?: Record<string, unknown>) =>
    write("warn", event, context),
  error: (event: string, context?: Record<string, unknown>) =>
    write("error", event, context),
};
