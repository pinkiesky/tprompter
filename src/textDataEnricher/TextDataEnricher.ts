import { Logger } from '../logger/index.js';
import { InjectLogger } from '../logger/logger.decorator.js';
import { IO } from '../utils/IO.js';
import { join } from 'node:path';
import { getFilePathsFromLine } from '../utils/enrichTextData.js';
import { Service } from 'typedi';
import { parse } from 'yaml';
import { minimatch } from 'minimatch';

export interface DirectoryConfig {
  exclude?: string[];
  include?: string[];
  allowedExtensions?: string[];
}

const DEFAULT_CONFIG: Readonly<DirectoryConfig> = {
  exclude: ['node_modules', '.git', 'package-lock.json', 'yarn.lock'],
  allowedExtensions: ['.ts', '.svelte', '.js', '.jsx', '.html', '.css'],
};

@Service()
export class TextDataEnricher {
  static CONFIGURATION_FILENAME = '.promptconfig.yaml';

  constructor(
    private io: IO,
    @InjectLogger(TextDataEnricher) private logger: Logger,
  ) {}

  async enrichRawInput(data: string, config = DEFAULT_CONFIG): Promise<string> {
    const lines = data.split('\n');
    const result = [];

    for (const line of lines) {
      const paths = getFilePathsFromLine(line);

      if (paths.length) {
        for (const path of paths) {
          const content = await this.handlePath(path, config);
          if (content) {
            result.push(content);
          }
        }
      } else {
        result.push(line);
      }
    }

    return result.join('\n');
  }

  private async handlePath(path: string, config: DirectoryConfig): Promise<string | null> {
    const stat = await this.io.stat(path);

    if (stat.isFile()) {
      return this.handleFile(path, config);
    }

    if (stat.isDirectory()) {
      return this.handleDirectory(path, config);
    }

    this.logger.info(`Path is not a file or directory: ${path}`);

    return null;
  }

  private async handleFile(path: string, config: DirectoryConfig): Promise<string> {
    this.logger.debug(`Reading file: ${path}`);

    const content = await this.io.readFile(path);
    return [`---- FILE: ${path}\n`, content].join('\n');
  }

  private async handleDirectory(path: string, config: DirectoryConfig): Promise<string> {
    this.logger.debug(`Reading directory: ${path}`);

    const configPath = join(path, TextDataEnricher.CONFIGURATION_FILENAME);
    let actualConfig = config;

    if (await this.io.exists(configPath)) {
      const configRaw = await this.io.readFile(configPath);
      const configParsed = parse(configRaw) as DirectoryConfig;

      this.logger.debug(`Apply configuration file: ${configPath}`);

      actualConfig = {
        ...actualConfig,
        ...configParsed,
      };
    }

    const result = [];
    let items = await this.io.readdir(path);
    this.logger.debug(`Found ${items.length} items in directory: ${path}`);

    items = items
      .filter((item) => item.isFile() || item.isDirectory())
      .filter((item) => item.name !== TextDataEnricher.CONFIGURATION_FILENAME)
      .filter((item) => {
        if (
          item.isFile() &&
          actualConfig.allowedExtensions?.length &&
          !actualConfig.allowedExtensions.some((ext) => item.name.endsWith(ext))
        ) {
          return false;
        }

        if (actualConfig.include?.length) {
          return actualConfig.include.some((pattern) => minimatch(item.name, pattern));
        }

        if (actualConfig.exclude?.length) {
          return !actualConfig.exclude.some((pattern) => minimatch(item.name, pattern));
        }

        return true;
      });

    for (const item of items) {
      const content = await this.handlePath(join(path, item.name), actualConfig);
      if (content) {
        result.push(content);
      }
    }

    return result.join('\n');
  }
}
