import { StringParserError } from './errors/StringParserError.js';

export class StringParsers {
  static booleanParser(raw: unknown, strict = false): boolean {
    if (typeof raw === 'boolean') {
      return raw;
    }

    if (strict) {
      if (raw === 'true' || raw === '1') {
        return true;
      }

      if (raw === 'false' || raw === '0') {
        return false;
      }

      throw new StringParserError(`${raw}`, 'boolean');
    }

    return StringParsers.stringParser(raw).toLowerCase() === 'true';
  }

  static stringParser(raw: unknown): string {
    return `${raw}`;
  }

  static numberParser(raw: unknown, strict = false): number {
    const parsed = parseInt(`${raw}`, 10);

    if (strict && isNaN(parsed)) {
      throw new StringParserError(`${raw}`, 'number');
    }

    return parsed;
  }
}
