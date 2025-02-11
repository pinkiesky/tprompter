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
    switch (strategy) {
      case AvailableActions.PRINT_TO_CONSOLE:
        await this.printToConsole(content);
        break;
      case AvailableActions.OPEN_IN_BROWSER:
        await this.openInBrowser(content);
        break;
      case AvailableActions.COPY_TO_CLIPBOARD:
        await this.copyToClipboard(content);
        break;
      default:
        throw new Error(`Unknown action: ${strategy}`);
    }
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
