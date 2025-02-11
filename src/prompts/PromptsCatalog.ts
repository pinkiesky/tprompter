import { Container, Service } from 'typedi';
import { WriteUnitTestsPrompt } from './WriteUnitTestsPrompt.js';
import { IPrompt } from './index.js';
import { CodeReviewPrompt } from './CodeReviewPrompt.js';

@Service()
export class PromptsCatalog {
  private prompts: IPrompt[] = [];

  constructor() {
    this.prompts.push(Container.get(WriteUnitTestsPrompt));
    this.prompts.push(Container.get(CodeReviewPrompt));
  }

  async getPrompt(name: string): Promise<IPrompt> {
    const prompt = this.prompts.find((p) => p.name === name);
    if (!prompt) {
      throw new Error(`Prompt with name ${name} not found`);
    }

    return prompt;
  }

  async listPrompts(): Promise<string[]> {
    return this.prompts.map((p) => p.name);
  }
}
