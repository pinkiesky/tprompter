import { Service } from 'typedi';
import { StdinDataReader } from '../utils/StdinDataReader.js';
import { IPrompt } from './index.js';
import { TextDataEnricher } from '../textDataEnricher/TextDataEnricher.js';

@Service()
export class WriteUnitTestsPrompt implements IPrompt {
  name = 'write_unit_tests';

  constructor(
    private stdinReader: StdinDataReader,
    private enricher: TextDataEnricher,
  ) {}

  async generate(): Promise<string> {
    const inputExamplesRaw = await this.stdinReader.readData('Enter unit test examples:');
    const inputCodeRaw = await this.stdinReader.readData('Enter the code that should be tested:');

    const inputCode = await this.enricher.enrichRawInput(inputCodeRaw.trim());
    const inputExamples = await this.enricher.enrichRawInput(inputExamplesRaw.trim());

    return `
You are a senior developer at a software company. You have been tasked with writing unit tests a code.
You can use the following unit test examples for reference:

\`\`\`
${inputExamples}
\`\`\`

You are provided with the following code that needs to be tested:

\`\`\`
${inputCode}
\`\`\`

Your task is to:
	1.	Write a new unit test file that thoroughly tests the provided code.
	2.	Use the examples as a guide to ensure consistent structure, style, and patterns.
	3.	Use proper mocking and assertions where necessary to simulate real-world behavior and dependencies.

The output should include:
	•	A complete unit test file in that adheres to best practices.
	•	Avoid long comments and explanation. Instead, focus on writing clean, concise, and maintainable code.
`.trim();
  }
}
