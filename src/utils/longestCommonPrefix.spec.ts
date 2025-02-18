import { longestCommonPrefix } from './longestCommonPrefix.js';

describe('longestCommonPrefix', () => {
  const fixtures = [
    {
      input: [],
      expected: '',
    },
    {
      input: ['/usr/bin'],
      expected: '/usr/bin',
    },
    {
      input: ['/usr/bin', '/usr/lib'],
      expected: '/usr/',
    },
    {
      input: ['/usr/bin', ''],
      expected: '',
    },
    {
      input: ['/home/user/docs/file1.txt', '/home/user/docs/file2.txt'],
      expected: '/home/user/docs/file',
    },
    {
      input: ['/var/log/nginx/access.log', '/var/log/nginx/error.log', '/var/log/nginx/other.log'],
      expected: '/var/log/nginx/',
    },
    {
      input: ['/a/b/c', '/a/b/d', '/a/b'],
      expected: '/a/b',
    },
    {
      input: ['/foo/bar', '/baz/qux'],
      expected: '/',
    },
    {
      input: ['/same/path', '/same/path', '/same/path'],
      expected: '/same/path',
    },
  ];

  it.each(fixtures)('should return "$expected" when given %j', ({ input, expected }) => {
    const result = longestCommonPrefix(input);
    expect(result).toEqual(expected);
  });
});
