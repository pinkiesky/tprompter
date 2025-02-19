import { Container, Service } from 'typedi';
import { WriteUnitTestsPrompt } from '../WriteUnitTestsPrompt.js';
import { IPrompt } from '../index.js';
import { CodeReviewPrompt } from '../CodeReviewPrompt.js';
import { WriteBoilerplatePrompt } from '../WriteBoilerplatePrompt.js';
import { StarterPrompt } from '../StarterPrompt.js';

@Service()
export class BuiltinPromptsCatalog {
  private prompts: IPrompt[] = [];

  constructor() {
    this.addPrompt([
      Container.get(WriteUnitTestsPrompt),
      Container.get(CodeReviewPrompt),
      Container.get(WriteBoilerplatePrompt),
      Container.get(StarterPrompt),
    ]);
  }

  addPrompt(prompt: IPrompt | IPrompt[]): void {
    if (Array.isArray(prompt)) {
      this.prompts.push(...prompt);
    } else {
      this.prompts.push(prompt);
    }
  }

  async getPrompt(name: string): Promise<IPrompt | null> {
    return this.prompts.find((p) => p.name === name) ?? null;
  }

  async listPrompts(): Promise<string[]> {
    return this.prompts.map((p) => p.name);
  }
}
