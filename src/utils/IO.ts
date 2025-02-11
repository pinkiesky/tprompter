import { Service } from 'typedi';
import { readFile, mkdir, writeFile, readdir, stat } from 'fs/promises';
import { Stats } from 'fs';

@Service()
export class IO {
  constructor() {}

  async readAllFilesRecursive(
    folderOrFile: string,
    filter: (p: string, s: Stats) => boolean = () => true,
  ): Promise<{ data: string; path: string }[]> {
    const stats = await stat(folderOrFile);
    if (stats.isDirectory()) {
      const files = await readdir(folderOrFile);
      const result: { data: string; path: string }[] = [];
      for (const file of files) {
        const path = `${folderOrFile}/${file}`;
        const fileStats = await stat(path);
        if (fileStats.isDirectory()) {
          result.push(...(await this.readAllFilesRecursive(path, filter)));
        } else if (filter(path, fileStats)) {
          result.push({
            data: await this.readFile(path),
            path,
          });
        }
      }
      return result;
    } else if (filter(folderOrFile, stats)) {
      return [
        {
          data: await this.readFile(folderOrFile),
          path: folderOrFile,
        },
      ];
    }

    return [];
  }

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
