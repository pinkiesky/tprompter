import { Service } from 'typedi';
import { enrichTextData } from '../utils/enrichTextData.js';
import { StdinDataReader } from '../utils/StdinDataReader.js';
import { IPrompt } from './index.js';
import { TextDataEnricher } from '../textDataEnricher/TextDataEnricher.js';

@Service()
export class CodeReviewPrompt implements IPrompt {
  name = 'code_review_prompt';

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

Your task is to make a code review. Please, consider the code maintanibility, security and logical concerns, and any improvements you can suggest.
Your task is very important to the team, and your feedback will help to improve the overall code quality and maintainability of the project.
  `.trim();
  }
}
