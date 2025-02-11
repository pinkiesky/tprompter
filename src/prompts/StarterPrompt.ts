import { Service, Container } from 'typedi';
import { enrichTextData } from '../utils/enrichTextData.js';
import { StdinDataReader } from '../utils/StdinDataReader.js';
import { IO } from '../utils/IO.js';
import { IPrompt } from './index.js';

@Service()
export class StarterPrompt implements IPrompt {
  name = 'starter';

  constructor(
    private stdinReader: StdinDataReader,
    private io: IO,
  ) {}

  isAcceptableExtension(file: string): boolean {
    const exts = ['.ts', '.svelte', '.js', '.jsx', '.html', '.css'];
    return exts.some((ext) => file.endsWith(ext));
  }

  async generate(): Promise<string> {
    const inputCode = await this.stdinReader.readData('Enter the source code files:');

    const enricher = async (path: string) => {
      const d = await this.io.readAllFilesRecursive(path, (p) => this.isAcceptableExtension(p));
      return d.flatMap(({ data, path }) => ['----', `FILE: ${path}\n`, data]).join('\n');
    };

    return `
You are a senior developer at a software company. You are provided with the following code:

\`\`\`
${await enrichTextData(inputCode, enricher)}
\`\`\`

I will write you questions or ask for favors based on the code provided.
`.trim();
  }
}
