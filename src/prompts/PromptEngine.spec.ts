import { PromptsEngine } from './PromptEngine.js';

describe(PromptsEngine.name, () => {
  describe('compile', () => {
    it('example 1', async () => {
      const fn = PromptsEngine.compile('Hello, ${name}!');
      expect(fn({ name: 'world' })).resolves.toEqual('Hello, world!');
    });

    it('example 2', async () => {
      const fn = PromptsEngine.compile('Hello');
      expect(fn()).resolves.toEqual('Hello');
    });

    it('example 3', async () => {
      const fn = PromptsEngine.compile('${callable("world")}');
      expect(fn({ callable: (name: string) => `Hello, ${name}!` })).resolves.toEqual(
        'Hello, world!',
      );
    });

    it('example 4', async () => {
      const fn = PromptsEngine.compile('${callable(3 + 5)}');
      expect(fn({ callable: (a: any) => a })).resolves.toEqual('8');
    });

    it('multiple components', async () => {
      const fn = PromptsEngine.compile('${a} ${b} ${c}!');
      expect(fn({ a: 'Hello', b: 'world', c: '!' })).resolves.toEqual('Hello world !!');
    });

    it('empty template', async () => {
      const fn = PromptsEngine.compile('');
      expect(fn()).resolves.toEqual('');
    });

    it('empty template', async () => {
      const fn = PromptsEngine.compile('${+new Date(0)}');
      expect(fn()).resolves.toEqual('0');
    });

    it('empty template', async () => {
      const fn = PromptsEngine.compile('${a()}');
      expect(
        await fn({
          a: () => Promise.resolve(1),
        }),
      ).toEqual('1');
    });
  });
});
