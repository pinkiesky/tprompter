import { Service } from 'typedi';
import { PromptsCatalog } from './prompts/PromptsCatalog.js';
import { Actions, AvailableActions } from './actions/Actions.js';
import { ArchiveService } from './archive/Archive.js';
import { countTokens } from 'gpt-tokenizer';

@Service()
export class MainController {
  constructor(
    private catalog: PromptsCatalog,
    private actions: Actions,
    private archive: ArchiveService,
  ) {}

  reportTokensCount(content: string): void {
    const tokensCount = countTokens(content);
    console.log('Tokens count:', tokensCount);
  }

  async listPrompts(): Promise<string[]> {
    return this.catalog.listPrompts();
  }

  async generateAndEvaluate(name: string, after: AvailableActions): Promise<void> {
    const prompt = await this.catalog.getPrompt(name);
    const content = await prompt.generate();

    this.reportTokensCount(content);

    await Promise.all([
      this.archive.save({ description: name, content }),
      this.actions.evaluate(after, content),
    ]);
  }

  async getFromArchiveByIndexAndEvaluate(index: number, after: AvailableActions): Promise<void> {
    const record = await this.archive.fromTheEnd(index);
    if (!record) {
      throw new Error('Record not found');
    }

    this.reportTokensCount(record.content);

    await this.actions.evaluate(after, record.content);
  }
}
