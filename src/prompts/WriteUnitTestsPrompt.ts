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

  async generate(): Promise<string> {
    const inputCode = await this.stdinReader.readData('Enter the TypeScript + NestJS code:');
    const inputExamples = await this.stdinReader.readData('Enter the Jest unit test examples:');

    return `
I have the following TypeScript code:

\`\`\`typescript
${await enrichTextData(inputCode, this.io.readFile)}
\`\`\`

I also have some Jest unit test examples for reference:

\`\`\`typescript
${await enrichTextData(inputExamples, this.io.readFile)}
\`\`\`

Your task is to:
	1.	Write a new unit test file that thoroughly tests the provided code.
	2.	Use the examples as a guide to ensure consistent structure, style, and patterns.
	3.	Ensure the tests achieve 100% code coverage, including edge cases and exceptional scenarios.
	4.	Use proper mocking and assertions where necessary to simulate real-world behavior and dependencies.

The output should include:
	•	A complete unit test file in Jest that adheres to best practices.
	•	An explanation or breakdown (optional) of how the provided test file ensures complete code coverage.
  `.trim();
  }
}
