import { enrichTextData, getFilePathsFromLine } from './enrichTextData.js';

describe('enrichTextData', () => {
  describe('getFilePathsFromLine', () => {
    const fixtures = [
      {
        input: 'Hello, world!',
        expected: [],
      },
      {
        input: '/fixtures/file1.txt',
        expected: ['/fixtures/file1.txt'],
      },
      {
        input: '  /fixtures/file1.txt',
        expected: ['/fixtures/file1.txt'],
      },
      {
        input: '/fixtures/file1.txt /fixtures/file2.txt',
        expected: ['/fixtures/file1.txt', '/fixtures/file2.txt'],
      },
      {
        input: "'/fixtures/file1.txt'",
        expected: ['/fixtures/file1.txt'],
      },
      // FIXME: This test case is failing
      // {
      //   input: "/Users/rglr/Downloads/Invoices.xlsx\\ -\\ 2024dev.pdf '/fixtures/file1.txt'",
      //   expected: [
      //     '/Users/rglr/Downloads/Invoices.xlsx\\ -\\ 2024dev.pdf',
      //     '/fixtures/file1.txt',
      //   ],
      // },
    ];

    it.each(fixtures)(
      'should extract filepaths from the given text data: %j',
      ({ input, expected }) => {
        const result = getFilePathsFromLine(input);

        expect(result).toEqual(expected);
      },
    );
  });

  describe('enrichTextData', () => {
    const fixtures = [
      {
        input: 'Hello, world!',
        expected: 'Hello, world!',
      },
      {
        input: ['a', '/fixtures/file1.txt', 'b'].join('\n'),
        expected: ['a', 'resolved:/fixtures/file1.txt', 'b'].join('\n'),
      },
      {
        input: ['a', '/fixtures/file1.txt /fixtures/file2.txt', 'b'].join('\n'),
        expected: ['a', 'resolved:/fixtures/file1.txt', 'resolved:/fixtures/file2.txt', 'b'].join(
          '\n',
        ),
      },
      {
        input: ['a', `'/fixtures/file1.txt'`, 'b'].join('\n'),
        expected: ['a', 'resolved:/fixtures/file1.txt', 'b'].join('\n'),
      },
      // FIXME
      // {
      //   input: [
      //     'a',
      //     `/Users/rglr/Downloads/Invoices.xlsx\\ -\\ 2024dev.pdf '/fixtures/file1.txt's`,
      //     'b',
      //   ].join('\n'),
      //   expected: [
      //     'a',
      //     'resolved:/Users/rglr/Downloads/Invoices.xlsx\\ -\\ 2024dev.pdf',
      //     `'/fixtures/file1.txt'`,
      //     'b',
      //   ].join('\n'),
      // },
    ];

    it.each(fixtures)('should replace filepaths with file content', async ({ input, expected }) => {
      const fileResolver = jest
        .fn()
        .mockImplementation((path: string) => Promise.resolve(`resolved:${path}`));
      const result = await enrichTextData(input, fileResolver);

      expect(result).toBe(expected);
    });
  });
});
