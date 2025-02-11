import { Service } from 'typedi';
import { enrichTextData } from '../utils/enrichTextData.js';
import { StdinDataReader } from '../utils/StdinDataReader.js';
import { IO } from '../utils/IO.js';
import { IPrompt } from './index.js';

@Service()
export class CodeReviewPrompt implements IPrompt {
  name = 'code_review_prompt';

  constructor(
    private stdinReader: StdinDataReader,
    private io: IO,
  ) {}

  isAcceptableExtension(file: string): boolean {
    const exts = ['.ts', '.svelte', '.js', '.jsx', '.html', '.css'];
    return exts.some((ext) => file.endsWith(ext));
  }

  async generate(): Promise<string> {
    const inputCode = await this.stdinReader.readData('Enter the code:');

    const enricher = async (path: string) => {
      const d = await this.io.readAllFilesRecursive(path, (p) => this.isAcceptableExtension(p));
      return d.flatMap(({ data, path }) => ['----', `FILE: ${path}\n`, data]).join('\n');
    };

    return `
You are a senior developer at a software company. You are provided with the following code:

\`\`\`
${await enrichTextData(inputCode, enricher)}
\`\`\`

Your task is to make a code review. Please, consider the code maintanibility, security and logical concerns, and any improvements you can suggest.
Your task is very important to the team, and your feedback will help to improve the overall code quality and maintainability of the project.
  `.trim();
  }
}
