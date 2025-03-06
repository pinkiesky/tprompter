import { Service } from 'typedi';
import { StdinDataReader } from '../utils/StdinDataReader.js';
import { IPrompt } from './index.js';
import { TextDataEnricher } from '../textDataEnricher/TextDataEnricher.js';

@Service()
export class SummaryPrompt implements IPrompt {
  name = 'summary';

  constructor(
    private stdinReader: StdinDataReader,
    private enricher: TextDataEnricher,
  ) {}

  async generate(): Promise<string> {
    const inputCodeRaw = await this.stdinReader.readData('Enter the source code files');
    const inputCode = await this.enricher.enrichRawInput(inputCodeRaw.trim());

    return `
You are an AI assistant specialized in generating concise summaries.

I will provide you with a text. Your tasks are to:
1. Read the text and understand the main points.
2. Summarize the text in a concise format that includes the main ideas and key points.
3. Structure the summary in a way that clearly highlights the most important information.

Be short and to the point. Your users are looking for a quick overview of the text.

**Here is the text:**
${inputCode}
      `.trim();
  }
}
