import { Service } from 'typedi';
import { runDisposableServer } from '../utils/disposableServer/index.js';
import open from 'open';
import { InjectLogger } from '../logger/logger.decorator.js';
import { Logger } from '../logger/index.js';
import { file } from 'tmp-promise';
import { IO } from '../utils/IO.js';
// @ts-expect-error - no types available
import markdownToCli from 'cli-markdown';
import hljs from 'highlight.js';

export enum AvailableActions {
  PRINT_TO_CONSOLE = 'print',
  PRINT_TO_CONSOLE_RAW = 'print_raw',
  OPEN_IN_CHATGPT = 'chatgpt',
  COPY_TO_CLIPBOARD = 'copy',
  RUN_EDITOR = 'editor',
}

@Service()
export class Actions {
  constructor(
    @InjectLogger(Actions) private logger: Logger,
    private io: IO,
  ) {
    if (!hljs.listLanguages().includes('fish')) {
      hljs.registerLanguage('fish', () => hljs.getLanguage('bash')!);
    }
  }

  private actionsMap: Record<AvailableActions, (s: string) => void> = {
    [AvailableActions.PRINT_TO_CONSOLE]: this.printToConsole,
    [AvailableActions.PRINT_TO_CONSOLE_RAW]: this.printToConsoleRaw,
    [AvailableActions.OPEN_IN_CHATGPT]: this.openInChatGPT,
    [AvailableActions.COPY_TO_CLIPBOARD]: this.copyToClipboard,
    [AvailableActions.RUN_EDITOR]: this.runEditor,
  };

  async evaluate(strategy: AvailableActions, content: string): Promise<void> {
    const action = this.actionsMap[strategy];
    if (!action) {
      throw new Error(`Unknown action: ${strategy}`);
    }

    this.logger.info(`Executing action: ${strategy}`);
    await action.call(this, content);
  }

  async printToConsole(content: string): Promise<void> {
    const out = markdownToCli(content);
    this.printToConsoleRaw(out);
  }

  async printToConsoleRaw(content: string): Promise<void> {
    process.stdout.write(content);

    if (!content.endsWith('\n')) {
      process.stdout.write('\n');
    }
  }

  async openInChatGPT(content: string): Promise<void> {
    const server = await runDisposableServer(content);

    const gptUrl = `https://chatgpt.com/#url=${server.url}`;
    open(gptUrl).catch((err) => this.logger.error(err));
  }

  async copyToClipboard(content: string): Promise<void> {
    const clipboardy = await import('clipboardy');
    await clipboardy.default.write(content);
  }

  async runEditor(content: string): Promise<void> {
    const { path } = await file({ postfix: '.txt' });
    await this.io.writeFile(path, content);

    await open(path);
  }
}
