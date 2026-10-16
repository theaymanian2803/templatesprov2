type Level = 'debug' | 'info' | 'warn' | 'error'

function emit(level: Level, message: string, context?: Record<string, unknown>) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    message,
    ...(context ? { context } : {}),
  }
  const line = `[${entry.level}] ${entry.message}`
  if (level === 'error') console.error(line, context ?? '')
  else if (level === 'warn') console.warn(line, context ?? '')
  else console.log(line, context ?? '')
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => emit('debug', message, context),
  info: (message: string, context?: Record<string, unknown>) => emit('info', message, context),
  warn: (message: string, context?: Record<string, unknown>) => emit('warn', message, context),
  error: (message: string, context?: Record<string, unknown>) => emit('error', message, context),
}
