import { Service } from 'typedi';

@Service()
export class Logger {
  constructor() {}
  info(message: string): void {
    console.log(message);
  }
}
