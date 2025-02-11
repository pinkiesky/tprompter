import { Container, Service } from 'typedi';
import { WriteUnitTestsPrompt } from './WriteUnitTestsPrompt.js';
import { IPrompt } from './index.js';
import { CodeReviewPrompt } from './CodeReviewPrompt.js';
import { WriteBoilerplatePrompt } from './WriteBoilerplanePrompt.js';
import { StarterPrompt } from './StarterPrompt.js';

@Service()
export class PromptsCatalog {
  private prompts: IPrompt[] = [];

  constructor() {
    this.addPrompt([
      Container.get(WriteUnitTestsPrompt),
      Container.get(CodeReviewPrompt),
      Container.get(WriteBoilerplatePrompt),
      Container.get(StarterPrompt),
      Container.get(CodeReviewPrompt),
    ]);
  }

  addPrompt(prompt: IPrompt | IPrompt[]): void {
    if (Array.isArray(prompt)) {
      this.prompts.push(...prompt);
    } else {
      this.prompts.push(prompt);
    }
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
