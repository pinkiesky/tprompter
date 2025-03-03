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
    private templateService: TemplateService,
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
    return this.templateService.listTemplates();
  }

  async generateAndEvaluate(nameOrFile: string, after: AvailableActions): Promise<void> {
    const prompt = await this.templateService.getPromptByNameOrPath(nameOrFile);
    if (!prompt) {
      throw new Error(`Prompt not found: ${nameOrFile}`);
    }

    const content = await prompt.generate();

    this.reportTokensCount(content);

    await Promise.all([
      this.archive.save({ description: nameOrFile, content, type: 'generate' }),
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

  async uninstallTemplate(name: string) {
    return this.templateService.uninstallTemplate(name);
  }

  async installTemplate(name: string, filepath?: string) {
    let content;
    if (filepath) {
      content = await this.io.readFile(filepath);
    } else {
      content = await this.stdinReader.readData('Enter template content');
    }

    return this.templateService.installTemplate(name, content);
  }

  async openTemplatesFolder() {
    const folder = await this.templateService.getTemplatesFolder();
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

  async agent(nameOrFile: string, after: AvailableActions, model?: string): Promise<void> {
    const template = await this.templateService.getPromptByNameOrPath(nameOrFile);
    if (!template) {
      throw new Error(`Template not found: ${nameOrFile}`);
    }

    const content = await template.generate();
    const response = await this.llmService.agent(content, model);

    await Promise.all([
      this.archive.save({ description: nameOrFile, content: response, type: 'agent' }),
      this.actions.evaluate(after, response),
    ]);
  }
}
