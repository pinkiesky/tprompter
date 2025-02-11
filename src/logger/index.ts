import { Service } from 'typedi';
import winston from 'winston';

export type Logger = winston.Logger;

@Service()
export class LoggerService {
  readonly root: winston.Logger;

  constructor() {
    this.root = winston.createLogger({
      level: 'info',
      format: winston.format.cli(),
      transports: [new winston.transports.Console()],
    });
  }

  setLevel(level: string): void {
    this.root.level = level;
  }

  child(name: string): winston.Logger {
    return this.root.child({ name });
  }
}
