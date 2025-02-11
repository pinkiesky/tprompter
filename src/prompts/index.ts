import Container, { Service } from 'typedi';
import { enrichTextData } from '../utils/enrichTextData';
import { StdinDataReader } from '../utils/StdinDataReader';
import { IO } from '../utils/IO';
import { WriteUnitTestsPrompt } from './WriteUnitTestsPrompt';

@Service()
export class PromptsCatalog {
  private prompts: IPrompt[] = [];

  constructor() {
    this.prompts.push(Container.get(WriteUnitTestsPrompt));
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

export interface IPrompt {
  readonly name: string;
  generate(): Promise<string>;
}
