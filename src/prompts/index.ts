import { readDataFromStdin } from "../utils/readData";

export class PromptsCatalog {
  private prompts: IPrompt[] = [];

  constructor() {
    this.prompts.push(new WriteUnitTestsPrompt());
  }

  async getPrompt(name: string): Promise<IPrompt> {
    const prompt = this.prompts.find((p) => p.name === name);
    if (!prompt) {
      throw new Error(`Prompt with name ${name} not found`);
    }

    return prompt;
  }

  async listPrompts(): Promise<string[]> {
    return this.prompts.map((p) => p.name);
  }
}

export interface IPrompt {
  readonly name: string;
  generate(): Promise<string>;
}

export class WriteUnitTestsPrompt implements IPrompt {
  name = 'write_unit_tests';

  async generate(): Promise<string> {
    const inputCode = await readDataFromStdin('Enter the TypeScript + NestJS code:');
    const inputExamples = await readDataFromStdin('Enter the Jest unit test examples:');

    return `
I have the following TypeScript + NestJS code:

\`\`\`typescript
${inputCode}
\`\`\`

I also have some Jest unit test examples for reference:

\`\`\`typescript
${inputExamples}
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
