import { Service } from 'typedi';
import { StdinDataReader } from '../utils/StdinDataReader.js';
import { IPrompt } from './index.js';
import { TextDataEnricher } from '../textDataEnricher/TextDataEnricher.js';

@Service()
export class StarterPrompt implements IPrompt {
  name = 'starter';

  constructor(
    private stdinReader: StdinDataReader,
    private enricher: TextDataEnricher,
  ) {}

  async generate(): Promise<string> {
    const inputCodeRaw = await this.stdinReader.readData('Enter the source code files:');
    const inputCode = await this.enricher.enrichRawInput(inputCodeRaw.trim());

    return `
You are a senior developer at a software company. You are provided with the following code:

\`\`\`
${inputCode}
\`\`\`

I will write you questions or ask for favors based on the code provided.
`.trim();
  }
}
