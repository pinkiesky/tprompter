import { Service } from 'typedi';
import { BuiltinTemplatesCatalog } from './catalog/BuiltinTemplatesCatalog.js';
import { ExternalTemplatesCatalog } from './catalog/ExternalTemplatesCatalog.js';
import { IPrompt } from './index.js';
import { IO } from '../utils/IO.js';
import { PromptsEngine } from './PromptEngine.js';
import { DynamicPrompt } from './DynamicPrompt.js';

@Service()
export class TemplateService {
  constructor(
    private buildinPromptsCatalog: BuiltinTemplatesCatalog,
    private externalPromptsCatalog: ExternalTemplatesCatalog,
    private promptEngine: PromptsEngine,
    private io: IO,
  ) {}

  async getPromptByNameOrPath(nameOrFile: string): Promise<IPrompt | null> {
    if (this.isFilepath(nameOrFile)) {
      const templateContent = await this.io.readFile(nameOrFile);
      return new DynamicPrompt(nameOrFile, () => this.promptEngine.proceed(templateContent));
    }

    const externalContent = await this.externalPromptsCatalog.getTemplateContent(nameOrFile);
    if (externalContent) {
      return new DynamicPrompt(nameOrFile, () => this.promptEngine.proceed(externalContent));
    }

    const builtin = await this.buildinPromptsCatalog.getTemplate(nameOrFile);
    if (builtin) {
      return builtin;
    }

    return null;
  }

  async listTemplates(): Promise<string[]> {
    return [
      ...(await this.buildinPromptsCatalog.listTemplates()),
      ...(await this.externalPromptsCatalog.listTemplates()),
    ];
  }

  async installPrompt(name: string, content: string): Promise<void> {
    await this.externalPromptsCatalog.install(name, content);
  }

  async uninstallPrompt(name: string): Promise<void> {
    await this.externalPromptsCatalog.uninstall(name);
  }

  isFilepath(nameOrFile: string): boolean {
    return nameOrFile.startsWith('/') || nameOrFile.startsWith('./');
  }

  async getPromptsFolder(): Promise<string> {
    return this.externalPromptsCatalog.getTemplatesFolder();
  }
}
