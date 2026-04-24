import { ref } from 'vue';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  namespace: string;
  message: string;
  payload?: any;
}

export type LogHandler = (entry: LogEntry) => void | Promise<void>;

export interface LogConfig {
  enabled: boolean
  minLevel: LogLevel
  transport?: LogHandler
}

const LOG_CONFIG = ref<LogConfig>({
  enabled: true,
  minLevel: 'debug',
});

const LEVEL_WEIGHTS: Record<LogLevel, number> = {
  debug: 0, 
  info: 1,
  warn: 2,
  error: 3
};


export function register(newConfig: Partial<LogConfig>) {
    LOG_CONFIG.value = { ...LOG_CONFIG.value, ...newConfig };
}

/**
 * useLogger
 * @param namespace - Group logs by feature (e.g., "Auth", "Socket")
 */
export function useLogger(namespace: string = 'App') {
  
  const log = (level: LogLevel, message: string, payload?: any) => {
    if (!LOG_CONFIG.value.enabled) return;
    if (LEVEL_WEIGHTS[level] < LEVEL_WEIGHTS[LOG_CONFIG.value.minLevel]) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      namespace,
      message,
      payload
    };

    const colorMap: Record<LogLevel, string> = {
      debug: '#7f8c8d', // Grey
      info: '#2ecc71',  // Green
      warn: '#f1c40f',  // Yellow
      errohr: '#e74c3c'  // Red
    };

    // Console Output with Styling
    console.log(
      `%c[${entry.namespace}] %c${entry.level.toUpperCase()}%c: ${entry.message}`,
      `color: ${colorMap[level]}; font-weight: bold;`,
      `color: #fff; background: ${colorMap[level]}; padding: 2px 4px; border-radius: 3px;`,
      'color: inherit; font-weight: normal;',
      payload ?? ''
    );

    if (LOG_CONFIG.value.transport) {
      LOG_CONFIG.value.transport(entry);
    }
  };

  return {
    debug: (msg: string, data?: any) => log('debug', msg, data),
    info: (msg: string, data?: any) => log('info', msg, data),
    warn: (msg: string, data?: any) => log('warn', msg, data),
    error: (msg: string, data?: any) => log('error', msg, data)
  };
}
