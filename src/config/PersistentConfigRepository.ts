import { Inject, Service } from 'typedi';
import { PathsToken } from '../di/tokens.js';
import { Paths } from 'env-paths';
import { IO } from '../utils/IO.js';
import { join } from 'path';

@Service()
export class PersistentConfigRepository {
  private folder = this.paths.config;

  constructor(
    private io: IO,
    @Inject(PathsToken) private paths: Paths,
  ) {}

  get configPath(): string {
    return join(this.folder, 'config.json');
  }

  async getRawConfig(): Promise<string> {
    return this.io.readFile(this.configPath);
  }

  async saveRawConfig(data: string): Promise<void> {
    await this.io.mkdirRecursive(this.folder);
    await this.io.writeFile(this.configPath, data);
  }
}
