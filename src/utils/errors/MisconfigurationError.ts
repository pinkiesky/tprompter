export class MissconfigurationError extends Error {
  constructor(
    public readonly key: string,
    public readonly description: string,
  ) {
    super(`Misconfiguration error: ${key} - ${description}`);
  }
}
