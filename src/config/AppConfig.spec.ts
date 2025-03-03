import { Container } from 'typedi';
import { AppConfig, DEFAULT_APP_CONFIG } from './AppConfig.js';
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
    it('should return merged data (with default)', async () => {
      repoMock.getRawConfig.mockResolvedValue(JSON.stringify({ openAIApiKey: '123' }));

      await config.loadPersistent();
      await config.applyCLIArguments({ quiet: true } as any);

      expect(config.getConfig()).toEqual({
        openAIApiKey: '123',
        quiet: true,
        verbose: false,
        agentMaxTokens: DEFAULT_APP_CONFIG.agentMaxTokens,
        agentDefaultModel: DEFAULT_APP_CONFIG.agentDefaultModel,
      });
    });
  });

  describe('getAvailableConfigKeys', () => {
    it('should return all keys', () => {
      expect(config.getAvailableConfigKeys().length).toBeGreaterThan(0);
    });
  });
});
