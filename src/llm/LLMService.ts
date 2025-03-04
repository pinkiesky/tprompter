import { AppConfig } from '../config/AppConfig.js';
import { OpenAICompletionOptions, OpenAIService } from './OpenAIService.js';
import { countTokens } from 'gpt-tokenizer';
import { PromptTooLongError } from './errors/PromptTooLongError.js';
import { Service } from 'typedi';
import { EnvironmentInfo } from '../config/EnvironmentInfo.js';
import { InjectLogger } from '../logger/logger.decorator.js';
import { Logger } from '../logger/index.js';

@Service()
export class LLMService {
  static WARN_DELAY = 5000;

  constructor(
    private openAI: OpenAIService,
    private config: AppConfig,
    private env: EnvironmentInfo,
    @InjectLogger() private logger: Logger,
  ) {}

  async getCompletion(prompt: string, opts?: OpenAICompletionOptions): Promise<string> {
    const timeoutId = setTimeout(() => {
      this.logger.info('Request to LLM takes a little bit too long...');
    }, LLMService.WARN_DELAY);

    try {
      return await this.openAI.getCompletion(prompt, opts);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async agent(prompt: string, mbModel?: string): Promise<string> {
    this.checkPromptLength(prompt);

    const model = mbModel ?? this.config.getConfig().agentDefaultModel;
    return this.getCompletion(prompt, { model });
  }

  async question(prompt: string, model?: string): Promise<string> {
    this.checkPromptLength(prompt);

    return this.getCompletion(prompt, {
      developerMessages: [
        'You are helpful CLI tool, that works in a user shell. Be brief, clear and helpful. Your users is a developer, who is looking for a quick solution to a problem.',
        `Your environment: Platform: ${this.env.platform} ${this.env.machine}; Shell: ${this.env.shell}`,
      ],
      model,
    });
  }

  checkPromptLength(prompt: string): void {
    const config = this.config.getConfig();

    if (config.agentMaxTokens) {
      const tokenLength = countTokens(prompt);
      if (tokenLength > config.agentMaxTokens) {
        throw new PromptTooLongError(tokenLength, config.agentMaxTokens);
      }
    }
  }

  async listModels(): Promise<string[]> {
    return this.openAI.getSupportedModels();
  }
}
