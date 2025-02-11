import { Service } from 'typedi';
import { readFile } from 'fs/promises';
import { Logger } from './Logger.js';

@Service()
export class IO {
  constructor(private logger: Logger) {}

  async readFile(path: string): Promise<string> {
    return readFile(path, 'utf-8');
  }
}
