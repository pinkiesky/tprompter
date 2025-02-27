import { Container } from 'typedi';
import { AppConfig } from './AppConfig.js';
import { PersistentConfigRepository } from './PersistentConfigRepository.js';

describe(AppConfig.name, () => {
  let config: AppConfig;
  let repoMock: jest.Mocked<PersistentConfigRepository> = {
    getRawConfig: jest.fn(),
    saveRawConfig: jest.fn(),
  } as any;

  beforeEach(() => {
    Container.set(PersistentConfigRepository, repoMock);

    config = Container.get(AppConfig);
    config.resetConfig();
  });

  describe('setPersistentValue', () => {
    it('should save persistant value data', async () => {
      await config.setPersistentValue('openAIApiKey', 'oai');
      expect(repoMock.saveRawConfig).toHaveBeenCalledWith(
        expect.stringContaining('"openAIApiKey": "oai"'),
      );
    });
  });

  describe('getConfig', () => {
    it('should return merged data', async () => {
      repoMock.getRawConfig.mockResolvedValue(JSON.stringify({ openAIApiKey: '123' }));

      await config.loadPersistant();
      await config.applyCLIArguments({ quiet: true } as any);

      expect(config.getConfig()).toEqual({
        openAIApiKey: '123',
        quiet: true,
        verbose: false,
      });
    });
  });

  describe('getAvailableConfigKeys', () => {
    it('should return all keys', () => {
      expect(config.getAvailableConfigKeys()).toHaveLength(3);
    });
  });
});
