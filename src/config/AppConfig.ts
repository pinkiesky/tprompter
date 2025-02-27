import { Service } from 'typedi';
import { PersistentConfigRepository } from './PersistentConfigRepository.js';
import {
  AppConfigData,
  AppConfigDataValues,
  AppConfigDataValuesTransformers,
} from './AppConfigData.js';
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

  async loadPersistent(): Promise<void> {
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

  async setPersistentValue<T extends keyof AppConfigDataValues>(
    key: T,
    value: string,
  ): Promise<void> {
    const val = AppConfigDataValuesTransformers[key](value);
    this.persistentData[key] = val;

    await this.savePersistentConfig();
  }

  async deletePersistentValue(key: keyof AppConfigDataValues): Promise<void> {
    delete this.persistentData[key];
    await this.savePersistentConfig();
  }

  savePersistentConfig(): Promise<void> {
    return this.repo.saveRawConfig(this.persistentData.serialize());
  }

  getConfig(): Readonly<AppConfigData> {
    return this.persistentData.merge(this.argumentsData);
  }

  getAvailableConfigKeys(): string[] {
    return AppConfigData.getAvailableKeys();
  }
}
