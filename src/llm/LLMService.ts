import { AppConfig } from '../config/AppConfig.js';
import { OpenAIService } from './OpenAIService.js';
import { countTokens } from 'gpt-tokenizer';
import { PromptTooLongError } from './errors/PromptTooLongError.js';
import { Service } from 'typedi';
import { EnvironmentInfo } from '../config/EnvironmentInfo.js';

@Service()
export class LLMService {
  constructor(
    private openAI: OpenAIService,
    private config: AppConfig,
    private env: EnvironmentInfo,
  ) {}

  async agent(prompt: string, mbModel?: string): Promise<string> {
    this.checkPromptLength(prompt);

    const model = mbModel ?? this.config.getConfig().agentDefaultModel;
    return this.openAI.getCompletion(prompt, { model });
  }

  async question(prompt: string, model?: string): Promise<string> {
    this.checkPromptLength(prompt);

    return this.openAI.getCompletion(prompt, {
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
