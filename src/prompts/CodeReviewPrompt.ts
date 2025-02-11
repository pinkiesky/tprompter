import { Service, Container } from 'typedi';
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

  async generate(): Promise<string> {
    const inputCode = await this.stdinReader.readData('Enter the code:');

    const enricher = async (path: string) => {
      const d = await this.io.readAllFilesRecursive(path, (p) => p.toLowerCase().endsWith('.ts'));
      return d.flatMap(({ data, path }) => ['----', `FILE: ${path}\n`, data]).join('\n');
    };

    return `
You are a senior software developer. You have been tasked with code review to the following codebase:

\`\`\`
${await enrichTextData(inputCode, enricher)}
\`\`\`

Your task is to:
  1. Review the codebase and provide feedback on the code quality, maintainability, and best practices.
  2. Identify potential bugs, security vulnerabilities, and performance issues.
  3. Suggest improvements, refactorings, and optimizations where necessary.
  4. Find bad variable names, magic numbers, and other code smells.

Don't be afraid to be critical, but also provide constructive feedback and suggestions for improvement.
Your task is very important to the team, and your feedback will help to improve the overall code quality and maintainability of the project.
  `.trim();
  }
}
