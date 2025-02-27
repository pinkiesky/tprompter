import { Service } from 'typedi';
import { PersistentConfigRepository } from './PersistentConfigRepository.js';
import { AppConfigData } from './AppConfigData.js';
import { CLIArgumentsToAppConfigMapper } from './CLIArgumentsToConfigMapper.js';
import { ArgumentsCamelCase } from 'yargs';
import { InjectLogger } from '../logger/logger.decorator.js';
import { Logger } from '../logger/index.js';

@Service()
export class AppConfig {
  private persistentData: AppConfigData = AppConfigData.empty();
  private argumentsData: AppConfigData = AppConfigData.empty();

  constructor(
    private repo: PersistentConfigRepository,
    private mapper: CLIArgumentsToAppConfigMapper,
    @InjectLogger() private logger: Logger,
  ) {}

  async loadPersistant(): Promise<void> {
    try {
      const raw = await this.repo.getRawConfig();
      this.persistentData = AppConfigData.deserialize(raw);
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        this.logger.debug('No persistent config found');
      } else {
        this.logger.error('Failed to load persistent config: ', err);
      }
    }
  }

  async applyCLIArguments(data: ArgumentsCamelCase): Promise<void> {
    this.logger.debug('Applying CLI arguments to config', data);
    this.argumentsData = new AppConfigData(this.mapper.map(data));
  }

  resetConfig(): void {
    this.argumentsData = AppConfigData.empty();
    this.persistentData = AppConfigData.empty();
  }

  async setPersistentValue<T extends keyof AppConfigData>(
    key: T,
    value: AppConfigData[T],
  ): Promise<void> {
    this.persistentData[key] = value;
    await this.repo.saveRawConfig(this.persistentData.serialize());
  }

  getConfig(): Readonly<AppConfigData> {
    return this.persistentData.merge(this.argumentsData);
  }

  getAvailableConfigKeys(): string[] {
    return AppConfigData.getAvailableKeys();
  }
}
