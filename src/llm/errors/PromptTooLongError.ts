export class PromptTooLongError extends Error {
  constructor(
    public readonly length: number,
    public readonly maxTokens: number,
  ) {
    super('Prompt too long');
  }
}
