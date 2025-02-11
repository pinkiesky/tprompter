import { Service } from 'typedi';
import { readFile, mkdir, writeFile, readdir } from 'fs/promises';
import { Logger } from './Logger.js';

@Service()
export class IO {
  constructor(private logger: Logger) {}

  async readFile(path: string): Promise<string> {
    return readFile(path, 'utf-8');
  }

  async writeFile(path: string, content: string): Promise<void> {
    await writeFile(path, content, 'utf-8');
  }

  async mkdirRecursive(path: string): Promise<void> {
    await mkdir(path, { recursive: true });
  }

  async fileList(folder: string, extension?: string): Promise<string[]> {
    const files = await readdir(folder);
    return extension ? files.filter((file) => file.endsWith(extension)) : files;
  }
}
