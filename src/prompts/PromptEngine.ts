import { Service } from 'typedi';
import { StdinDataReader } from '../utils/StdinDataReader.js';
import { TextDataEnricher } from '../textDataEnricher/TextDataEnricher.js';

@Service()
export class PromptsEngine {
  constructor(
    private stdinReader: StdinDataReader,
    private enricher: TextDataEnricher,
  ) {}

  async proceed(template: string): Promise<string> {
    const compiledTemplate = PromptsEngine.compile(template);
    const result = await compiledTemplate({
      readStdin: async (placeholder = 'Input required') => {
        const inputCodeRaw = await this.stdinReader.readData(placeholder);
        return await this.enricher.enrichRawInput(inputCodeRaw.trim());
      },
    });

    return result.trim();
  }

  static compile(rawTemplate: string): (data?: Record<string, unknown>) => Promise<string> {
    const pieces = rawTemplate.split('${');
    const parts: (string | Function)[] = [pieces[0]];

    for (let i = 1; i < pieces.length; i++) {
      const [expression, rest] = pieces[i].split('}');
      const f = new Function('data', `with(data || {}) { return ${expression}; }`);

      parts.push(f);
      parts.push(rest);
    }

    return async (data?: Record<string, unknown>) => {
      const partsPromises = parts.map(async (part) => {
        if (typeof part === 'function') {
          const returns = part(data);
          if (returns && typeof returns.then === 'function') {
            return await returns;
          }

          return returns;
        }

        return part;
      });

      const resolvedParts = await Promise.all(partsPromises);
      return resolvedParts.join('');
    };
  }
}
