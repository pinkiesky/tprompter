import { Service } from 'typedi';
import { StdinDataReader } from '../utils/StdinDataReader.js';
import { IPrompt } from './index.js';
import { TextDataEnricher } from '../textDataEnricher/TextDataEnricher.js';

@Service()
export class CommitMessagePrompt implements IPrompt {
  name = 'commit_message';

  constructor(
    private stdinReader: StdinDataReader,
    private enricher: TextDataEnricher,
  ) {}

  async generate(): Promise<string> {
    const inputCodeRaw = await this.stdinReader.readData('Enter the source code files');
    const inputCode = await this.enricher.enrichRawInput(inputCodeRaw.trim());

    return `
You are an AI assistant specialized in writing concise and clear git commit messages. 

I will provide you with a \`git diff\` (the changes made in a codebase). Your task is to:
1. Analyze the diff to understand what has been changed or added.
2. Summarize those changes in a short, human-readable commit message.
3. Focus on *why* these changes were made and *what* they do.
4. Keep the message under 72 characters if possible (so it fits into common git commit formatting conventions).
5. Do not include boilerplate text like "Commit message:"—just provide the commit text.
6. Wrap all variables in \` backticks.

**Here is the diff:**
${inputCode}
      `.trim();
  }
}
