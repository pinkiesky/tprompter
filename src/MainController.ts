import { Service } from 'typedi';
import { Actions, AvailableActions } from './actions/Actions.js';
import { ArchiveService } from './archive/Archive.js';
import { countTokens } from 'gpt-tokenizer';
import { InjectLogger } from './logger/logger.decorator.js';
import { Logger } from './logger/index.js';
import { TemplateService } from './templates/PromptsService.js';
import { IO } from './utils/IO.js';
import { StdinDataReader } from './utils/StdinDataReader.js';
import { openFinder } from './utils/openFinder.js';
import { AssetsService } from './assets/AssetsService.js';
import { LLMService } from './llm/LLMService.js';

@Service()
export class MainController {
  constructor(
    private actions: Actions,
    private archive: ArchiveService,
    @InjectLogger(MainController) private logger: Logger,
    private promptsService: TemplateService,
    private io: IO,
    private stdinReader: StdinDataReader,
    private assetsService: AssetsService,
    private llmService: LLMService,
  ) {}

  reportTokensCount(content: string): void {
    const tokensCount = countTokens(content);

    this.logger.info(`Tokens count: ${tokensCount}`);
  }

  listTemplates(): Promise<string[]> {
    return this.promptsService.listTemplates();
  }

  async generateAndEvaluate(nameOrFile: string, after: AvailableActions): Promise<void> {
    const prompt = await this.promptsService.getPromptByNameOrPath(nameOrFile);
    if (!prompt) {
      throw new Error(`Prompt not found: ${nameOrFile}`);
    }

    const content = await prompt.generate();

    this.reportTokensCount(content);

    await Promise.all([
      this.archive.save({ description: nameOrFile, content }),
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

  async uninstallPrompt(name: string) {
    return this.promptsService.uninstallPrompt(name);
  }

  async installTemplate(name: string, filepath?: string) {
    let content;
    if (filepath) {
      content = await this.io.readFile(filepath);
    } else {
      content = await this.stdinReader.readData('Enter template content');
    }

    return this.promptsService.installPrompt(name, content);
  }

  async openPromptsFolder() {
    const folder = await this.promptsService.getPromptsFolder();
    await openFinder(folder);
  }

  async listAssets(): Promise<string[]> {
    return this.assetsService.listAvailableAssets();
  }

  async getAsset(name: string): Promise<string> {
    const asset = await this.assetsService.getAsset(name);
    if (!asset) {
      throw new Error(`Asset not found: ${name}`);
    }

    return asset;
  }

  async ask(nameOrFile: string, model?: string): Promise<string> {
    const prompt = await this.promptsService.getPromptByNameOrPath(nameOrFile);
    if (!prompt) {
      throw new Error(`Prompt not found: ${nameOrFile}`);
    }

    const content = await prompt.generate();
    this.reportTokensCount(content);

    return this.llmService.ask(content, model);
  }
}
