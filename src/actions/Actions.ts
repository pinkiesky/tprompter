import { Service } from 'typedi';
import { runDisposableServer } from '../utils/disposableServer/index.js';
import open from 'open';

export enum AvailableActions {
  PRINT_TO_CONSOLE = 'print',
  OPEN_IN_BROWSER = 'browser',
  COPY_TO_CLIPBOARD = 'copy',
}

@Service()
export class Actions {
  constructor() {}

  async evaluate(strategy: AvailableActions, content: string): Promise<void> {
    const actionsMap: Record<AvailableActions, Function> = {
      [AvailableActions.PRINT_TO_CONSOLE]: this.printToConsole,
      [AvailableActions.OPEN_IN_BROWSER]: this.openInBrowser,
      [AvailableActions.COPY_TO_CLIPBOARD]: this.copyToClipboard,
    };

    const action = actionsMap[strategy];
    if (!action) {
      throw new Error(`Unknown action: ${strategy}`);
    }

    await action.call(this, content);
  }

  async printToConsole(content: string): Promise<void> {
    console.log(content);
  }

  async openInBrowser(content: string): Promise<void> {
    const server = await runDisposableServer(content);

    const gptUrl = `https://chatgpt.com/#url=${server.url}`;
    open(gptUrl).catch(console.error);
  }

  async copyToClipboard(content: string): Promise<void> {
    const clipboardy = await import('clipboardy');
    await clipboardy.default.write(content);
  }
}
