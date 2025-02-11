export interface IPrompt {
  readonly name: string;
  generate(): Promise<string>;
}
