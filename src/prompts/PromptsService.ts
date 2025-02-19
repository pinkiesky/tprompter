import { Service } from 'typedi';
import { BuiltinPromptsCatalog } from './catalog/BuiltinPromptsCatalog.js';
import { ExternalPromptsCatalog } from './catalog/ExternalPromptsCatalog.js';
import { IPrompt } from './index.js';
import { IO } from '../utils/IO.js';
import { PromptsEngine } from './PromptEngine.js';
import { DynamicPrompt } from './DynamicPrompt.js';

@Service()
export class PromptsService {
  constructor(
    private buildinPromptsCatalog: BuiltinPromptsCatalog,
    private externalPromptsCatalog: ExternalPromptsCatalog,
    private promptEngine: PromptsEngine,
    private io: IO,
  ) {}

  async getPromptByNameOrPath(nameOrFile: string): Promise<IPrompt | null> {
    if (this.isFilepath(nameOrFile)) {
      const templateContent = await this.io.readFile(nameOrFile);
      return new DynamicPrompt(nameOrFile, () => this.promptEngine.proceed(templateContent));
    }

    const externalContent = await this.externalPromptsCatalog.getPromptContent(nameOrFile);
    if (externalContent) {
      return new DynamicPrompt(nameOrFile, () => this.promptEngine.proceed(externalContent));
    }

    const builtin = await this.buildinPromptsCatalog.getPrompt(nameOrFile);
    if (builtin) {
      return builtin;
    }

    return null;
  }

  async listPrompts(): Promise<string[]> {
    return [
      ...(await this.buildinPromptsCatalog.listPrompts()),
      ...(await this.externalPromptsCatalog.listPrompts()),
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
}
