type LogLevel = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR';

interface LogFields {
  [key: string]: unknown;
}

function log(severity: LogLevel, message: string, fields?: LogFields): void {
  const entry = {
    severity,
    message,
    timestamp: new Date().toISOString(),
    ...fields,
  };
  const output = JSON.stringify(entry);
  if (severity === 'ERROR') {
    console.error(output);
  } else if (severity === 'WARNING') {
    console.warn(output);
  } else {
    console.log(output);
  }
}

export const logger = {
  debug: (message: string, fields?: LogFields) => log('DEBUG', message, fields),
  info: (message: string, fields?: LogFields) => log('INFO', message, fields),
  warn: (message: string, fields?: LogFields) =>
    log('WARNING', message, fields),
  error: (message: string, fields?: LogFields) =>
    log('ERROR', message, fields),
};
