import { Service } from 'typedi';

@Service()
export class Clipboardy {
  constructor() {}

  async write(text: string): Promise<void> {
    const clipboardy = await import('clipboardy');
    await clipboardy.default.write(text);
  }
}
