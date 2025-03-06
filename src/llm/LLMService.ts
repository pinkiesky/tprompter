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

  async getCompletion(
    prompt: string | string[],
    opts?: Partial<OpenAICompletionOptions>,
  ): Promise<string> {
    this.checkPromptLength(prompt, opts);

    const timeoutId = setTimeout(() => {
      this.logger.info('Request to LLM takes a little bit too long...');
    }, LLMService.WARN_DELAY);

    try {
      return await this.openAI.getCompletion(prompt, {
        model: opts?.model ?? this.config.getConfig().agentDefaultModel ?? 'gpt-4o-mini',
        developerMessages: opts?.developerMessages,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async agent(prompt: string, mbModel?: string): Promise<string> {
    const model = mbModel ?? this.config.getConfig().agentDefaultModel;
    return this.getCompletion(prompt, { model });
  }

  async question(prompt: string, input: string, model?: string): Promise<string> {
    const config = this.config.getConfig();

    const userMessages = [];

    if (input) {
      userMessages.push(`<input from="pipe">${input}</input>`);
    }

    userMessages.push(`<question>${prompt}</question>`);

    return this.getCompletion(userMessages, {
      developerMessages: [
        'You are helpful CLI tool, that works in a user shell. Be brief, clear and provide a highly structured responses. Your users are skilled developers, who is looking for a quick solution to a problem.',
        `Your environment: Platform: ${this.env.platform} ${this.env.machine}; Shell: ${this.env.shell}`,
        `To access the text from the <input> section provided below you can suggest to a user to run \`${config.appName} archive last\` in the shell. Example, \`${config.appName} archive last input | grep "some text"\``,
      ],
      model,
    });
  }

  checkPromptLength(
    userMessages: string | string[],
    opts?: Partial<OpenAICompletionOptions>,
  ): void {
    let fullMessage = Array.isArray(userMessages) ? userMessages.join(' ') : userMessages;
    fullMessage += opts?.developerMessages?.join(' ').length ?? '';

    const config = this.config.getConfig();

    if (config.agentMaxTokens) {
      const tokenLength = countTokens(fullMessage);
      if (tokenLength > config.agentMaxTokens) {
        throw new PromptTooLongError(tokenLength, config.agentMaxTokens);
      }
    }
  }

  async listModels(): Promise<string[]> {
    return this.openAI.getSupportedModels();
  }
}
