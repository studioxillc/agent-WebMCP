export class WebMCPLogger {
  private prefix: string;

  constructor(prefix: string = 'WebMCP') {
    this.prefix = prefix;
  }

  info(message: string, ...args: any[]) {
    console.log(`[${this.prefix}] ℹ️ ${message}`, ...args);
  }

  warn(message: string, ...args: any[]) {
    console.warn(`[${this.prefix}] ⚠️ ${message}`, ...args);
  }

  error(message: string, ...args: any[]) {
    console.error(`[${this.prefix}] ❌ ${message}`, ...args);
  }

  debug(message: string, ...args: any[]) {
    if (process.env.DEBUG) {
      console.debug(`[${this.prefix}] 🐛 ${message}`, ...args);
    }
  }
}
