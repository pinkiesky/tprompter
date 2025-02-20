import path from 'path';
import { Container } from 'typedi';
import { TextDataEnricher } from '../../../src/textDataEnricher/TextDataEnricher.js';

describe(TextDataEnricher.name, () => {
  let enricher: TextDataEnricher;
  const assetsFolder = path.join(__dirname, 'assets');
  const replaceAssets = (...data: string[]) => data.join('\n').replace(/\@/g, assetsFolder);

  beforeAll(async () => {
    enricher = Container.get(TextDataEnricher);
  });

  afterAll(() => {});

  test('formatPieceName', () => {
    expect(enricher.formatPieceName('file.txt')).toBe('--- File: file.txt ---');
  });

  test('enrichRawInput (only files)', async () => {
    const data = replaceAssets('@/1f', '@/3f');
    const result = await enricher.enrichRawInput(data);

    expect(result.split('\n')).toEqual([
      enricher.formatPieceName('1f'),
      '1f',
      enricher.formatPieceName('3f'),
      '3f',
      '',
    ]);
  });

  test('enrichRawInput (files + raw text)', async () => {
    const data = replaceAssets('@/1f', 'text123', '@/3f', 'qwerty');
    const result = await enricher.enrichRawInput(data);

    expect(result.split('\n')).toEqual([
      enricher.formatPieceName('1f'),
      '1f',
      'text123',
      enricher.formatPieceName('3f'),
      '3f',
      'qwerty',
      '',
    ]);
  });

  test('enrichRawInput (directory with overrided config)', async () => {
    const data = replaceAssets('@/0d');
    const result = await enricher.enrichRawInput(data);

    const expected = new Array(10)
      .fill(0)
      .flatMap((_, i) => [enricher.formatPieceName(`${i}f2`), `${i}f2`]);

    expect(result.split('\n')).toEqual([...expected, '']);
  });

  test('enrichRawInput (directory recursive)', async () => {
    const data = replaceAssets('@');
    const result = await enricher.enrichRawInput(data);

    const count = result.split('\n').filter((line) => line.startsWith('--- File:')).length;
    expect(count).toBe(33);
  });
});
