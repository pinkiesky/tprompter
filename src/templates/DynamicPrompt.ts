import { IPrompt } from './index.js';

export class DynamicPrompt implements IPrompt {
  constructor(
    readonly name: string,
    readonly generate: () => Promise<string>,
  ) {}
}
