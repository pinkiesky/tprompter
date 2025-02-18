import { Service } from 'typedi';
import { StdinDataReader } from '../utils/StdinDataReader.js';
import { IPrompt } from './index.js';
import { TextDataEnricher } from '../textDataEnricher/TextDataEnricher.js';

@Service()
export class WriteBoilerplatePrompt implements IPrompt {
  name = 'write_boilerplate';

  constructor(
    private stdinReader: StdinDataReader,
    private enricher: TextDataEnricher,
  ) {}

  async generate(): Promise<string> {
    const inputCodeRaw = await this.stdinReader.readData('Enter the TypeScript + NestJS code:');
    const inputExamplesRaw = await this.stdinReader.readData('Enter the Jest unit test examples:');

    const inputCode = await this.enricher.enrichRawInput(inputCodeRaw.trim());
    const inputExamples = await this.enricher.enrichRawInput(inputExamplesRaw.trim());

    return `
You are a senior developer at a software company. You have been tasked with writing a boilerplate.
You can use the following Jest e2e test examples for reference:

\`\`\`typescript
${inputExamples}
\`\`\`

You are provided with the following TypeScript + NestJS code that needs to be tested:

\`\`\`typescript
${inputCode}
\`\`\`

Your task is to:
	1.	Write a boilerplate for e2e test file that thoroughly tests the provided code.
	2.	Use the examples as a guide to ensure consistent structure, style, and patterns.

The output should include:
	•	A test file in Jest that adheres to best practices.
	•	Avoid long comments and explanation. Instead, focus on writing clean, concise, and maintainable code.
`.trim();
  }
}
