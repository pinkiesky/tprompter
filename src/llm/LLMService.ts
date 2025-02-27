import { AppConfig } from "../config/AppConfig.js";
import { OpenAIService } from "./OpenAIService.js";
import { countTokens } from 'gpt-tokenizer';
import { PromptTooLongError } from "./errors/PromptTooLongError.js";
import { Service } from "typedi";

@Service()
export class LLMService {
  constructor(
    private openAI: OpenAIService,
    private config: AppConfig,
  ) {}

  async ask(prompt: string, mbModel?: string): Promise<string> {
    const config = this.config.getConfig();
    if (config.maxAskTokens) {
      const tokenLength = countTokens(prompt);
      if (tokenLength > config.maxAskTokens) {
        throw new PromptTooLongError(tokenLength, config.maxAskTokens);
      }
    }

    const model = mbModel ?? config.askModel;
    return this.openAI.getCompletion(prompt, model);
  }

  async listModels(): Promise<string[]> {
    return this.openAI.getSupportedModels();
  }
}
