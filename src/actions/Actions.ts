import { Service } from 'typedi';
import { Clipboardy } from './Clipboard.js';

export enum AvailableActions {
  PRINT_TO_CONSOLE = 'printToConsole',
  OPEN_IN_BROWSER = 'openInBrowser',
  COPY_TO_CLIPBOARD = 'copyToClipboard',
}

@Service()
export class Actions {
  constructor(private cb: Clipboardy) {}

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
    // Open the URL in the default browser
    // This is a placeholder for the real implementation
    console.log(`Opening some in the browser`);
  }

  async copyToClipboard(content: string): Promise<void> {
    await this.cb.write(content);
  }
}
