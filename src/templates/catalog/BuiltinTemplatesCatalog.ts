import { Container, Service } from 'typedi';
import { WriteUnitTestsPrompt } from '../WriteUnitTestsPrompt.js';
import { IPrompt } from '../index.js';
import { CodeReviewPrompt } from '../CodeReviewPrompt.js';
import { StarterPrompt } from '../StarterPrompt.js';
import { CommitMessagePrompt } from '../CommitMessagePrompt.js';

@Service()
export class BuiltinTemplatesCatalog {
  private templates: IPrompt[] = [];

  constructor() {
    this.addTemplate([
      Container.get(WriteUnitTestsPrompt),
      Container.get(CodeReviewPrompt),
      Container.get(StarterPrompt),
      Container.get(CommitMessagePrompt),
    ]);
  }

  addTemplate(template: IPrompt | IPrompt[]): void {
    if (Array.isArray(template)) {
      this.templates.push(...template);
    } else {
      this.templates.push(template);
    }
  }

  async getTemplate(name: string): Promise<IPrompt | null> {
    return this.templates.find((p) => p.name === name) ?? null;
  }

  async listTemplates(): Promise<string[]> {
    return this.templates.map((p) => p.name);
  }
}
