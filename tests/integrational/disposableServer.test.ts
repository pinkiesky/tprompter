import fetch from 'node-fetch';
import { runDisposableServer } from '../../src/utils/disposableServer/index.js';

describe('disposableServer', () => {
  test('flow', async () => {
    const content = 'content 123456790';
    const { server, url } = await runDisposableServer(content);

    try {
      const response = await fetch(url);
      const text = await response.text();

      expect(text).toBe(content);

      expect(fetch(url)).rejects.toThrow('ECONNREFUSED');
    } finally {
      server.close();
    }
  });
});
