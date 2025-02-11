import { Service, Container } from 'typedi';
import { enrichTextData } from '../utils/enrichTextData.js';
import { StdinDataReader } from '../utils/StdinDataReader.js';
import { IO } from '../utils/IO.js';
import { IPrompt } from './index.js';

@Service()
export class WriteUnitTestsPrompt implements IPrompt {
  name = 'write_unit_tests';

  constructor(
    private stdinReader: StdinDataReader,
    private io: IO,
  ) {}

  isAcceptableExtension(file: string): boolean {
    const exts = ['.ts', '.svelte', '.js', '.jsx', '.html', '.css'];
    return exts.some((ext) => file.endsWith(ext));
  }

  async generate(): Promise<string> {
    const inputCode = await this.stdinReader.readData('Enter the TypeScript + NestJS code:');
    const inputExamples = await this.stdinReader.readData('Enter the Jest unit test examples:');

    const enricher = async (path: string) => {
      const d = await this.io.readAllFilesRecursive(path, (p) => this.isAcceptableExtension(p));
      return d.flatMap(({ data, path }) => ['----', `FILE: ${path}\n`, data]).join('\n');
    };

    return `
You are a senior developer at a software company. You have been tasked with writing unit tests a code.
You can use the following Jest unit test examples for reference:

\`\`\`typescript
${await enrichTextData(inputExamples, enricher)}
\`\`\`

You are provided with the following TypeScript + NestJS code that needs to be tested:

\`\`\`typescript
${await enrichTextData(inputCode, enricher)}
\`\`\`

Your task is to:
	1.	Write a new unit test file that thoroughly tests the provided code.
	2.	Use the examples as a guide to ensure consistent structure, style, and patterns.
	3.	Use proper mocking and assertions where necessary to simulate real-world behavior and dependencies.

The output should include:
	•	A complete unit test file in Jest that adheres to best practices.
	•	Avoid long comments and explanation. Instead, focus on writing clean, concise, and maintainable code.
`.trim();
  }
}
