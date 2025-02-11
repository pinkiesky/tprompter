import { Service } from 'typedi';
import { PromptsCatalog } from './prompts/PromptsCatalog.js';
import { Actions, AvailableActions } from './actions/Actions.js';

@Service()
export class MainController {
  constructor(
    private catalog: PromptsCatalog,
    private actions: Actions,
  ) {}

  async listPrompts(): Promise<string[]> {
    return this.catalog.listPrompts();
  }

  async generateAndEvaluate(name: string, after: AvailableActions): Promise<string> {
    const prompt = await this.catalog.getPrompt(name);
    const content = await prompt.generate();

    await this.actions.evaluate(after, content);

    return content;
  }
}
