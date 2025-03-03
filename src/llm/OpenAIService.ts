import { Service } from 'typedi';
import { AppConfig } from '../config/AppConfig.js';
import OpenAI from 'openai';
import { MissconfigurationError } from '../utils/errors/MisconfigurationError.js';
import { InjectLogger } from '../logger/logger.decorator.js';
import { Logger } from '../logger/index.js';

export interface OpenAICompletionOptions {
  model?: string;
  developerMessages?: string[];
}

@Service()
export class OpenAIService {
  private _client?: OpenAI;

  constructor(
    private config: AppConfig,
    @InjectLogger() private logger: Logger,
  ) {}

  get client(): OpenAI {
    if (!this._client) {
      const { openAIApiKey } = this.config.getConfig();
      if (!openAIApiKey) {
        throw new MissconfigurationError('openAIApiKey', 'OpenAI API key is missing');
      }

      this._client = new OpenAI({
        apiKey: openAIApiKey,
      });
    }

    return this._client;
  }

  async getCompletion(prompt: string, options: OpenAICompletionOptions = {}): Promise<string> {
    const actualModel = options.model ?? 'gpt-4o-mini';

    this.logger.debug('Getting completion from OpenAI', { actualModel });

    const messages: OpenAI.ChatCompletionMessageParam[] = [];

    if (options.developerMessages?.length) {
      const roleName = actualModel.startsWith('gpt-') ? 'system' : 'developer';
      messages.push(
        ...options.developerMessages.map(
          (content) => ({ role: roleName, content }) as OpenAI.ChatCompletionMessageParam,
        ),
      );
    }

    messages.push({ role: 'user', content: prompt });

    const completion = await this.client.chat.completions.create({
      model: actualModel,
      messages,
    });

    this.logger.debug('Got completion from OpenAI', {
      message: completion.choices[0].message,
      promptUsage: completion.usage?.prompt_tokens,
      completionUsage: completion.usage?.completion_tokens,
    });

    return completion.choices[0].message.content!;
  }

  async getSupportedModels(): Promise<string[]> {
    return ['gpt-4o-mini', 'gpt-4o', 'gpt-4o-large', 'o1', 'o1-mini', 'o3-mini'];
  }
}
