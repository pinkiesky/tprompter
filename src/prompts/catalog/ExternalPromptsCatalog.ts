import { Inject, Service } from 'typedi';
import { IO } from '../../utils/IO.js';
import { Paths } from 'env-paths';
import { PathsToken } from '../../di/tokens.js';
import { join } from 'node:path';

@Service()
export class ExternalPromptsCatalog {
  constructor(
    @Inject(PathsToken) private paths: Paths,
    private io: IO,
  ) {}

  async getPromptsFolder(): Promise<string> {
    const folder = join(this.paths.data, 'prompts');
    await this.io.mkdirRecursive(folder);

    return folder;
  }

  async getPromptContent(name: string): Promise<string | null> {
    const folder = await this.getPromptsFolder();
    const path = join(folder, name);

    if (await this.io.exists(path)) {
      return this.io.readFile(path);
    }

    return null;
  }

  async listPrompts(): Promise<string[]> {
    const folder = await this.getPromptsFolder();
    const files = await this.io.fileList(folder);

    return files;
  }

  async uninstall(name: string) {
    const folder = await this.getPromptsFolder();
    const path = join(folder, name);

    await this.io.unlink(path);
  }

  async install(name: string, content: string) {
    const folder = await this.getPromptsFolder();
    const path = join(folder, name);

    await this.io.writeFile(path, content);
  }
}
