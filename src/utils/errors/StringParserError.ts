export class StringParserError extends Error {
  constructor(
    public value: string,
    public expectedType: string,
  ) {
    super(`Failed to parse value: ${value}. Expected type: ${expectedType}`);
  }
}
