import { Service } from 'typedi';
import { StdinDataReader } from '../utils/StdinDataReader.js';
import { IPrompt } from './index.js';
import { TextDataEnricher } from '../textDataEnricher/TextDataEnricher.js';

@Service()
export class ChangelogPrompt implements IPrompt {
  name = 'detailed_changelog';

  constructor(
    private stdinReader: StdinDataReader,
    private enricher: TextDataEnricher,
  ) {}

  async generate(): Promise<string> {
    const inputCodeRaw = await this.stdinReader.readData('Enter the source code files');
    const inputCode = await this.enricher.enrichRawInput(inputCodeRaw.trim());

    return `
You are an AI assistant specialized in generating detailed changelogs for software projects.

I will provide you with a \`git diff\` (the changes made in a codebase). Your tasks are to:
1. Analyze the diff to identify what changes have been made.
2. Summarize these changes in a detailed format that includes the nature of the changes, the reason
  behind them, and any relevant context.
3. Structure the changelog in a way that clearly highlights additions, deletions, and modifications.
4. Provide timestamps and relevant version information if necessary.

**Here is the diff:**
${inputCode}
      `.trim();
  }
}
