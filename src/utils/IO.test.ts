import { Container } from 'typedi';
import { IO } from './IO.js';
import * as fs from 'node:fs';
import { Logger } from './Logger.js';

describe(IO.name, () => {
  let io: IO;

  beforeEach(() => {
    Container.set(Logger, {
      info: jest.fn(),
    });
    io = Container.get(IO);
  });

  describe('readFile', () => {
    it('should read a file and return its content', async () => {
      const filePath = '/path/to/file';
      const fileContent = 'mock file content';

      jest.spyOn(fs.promises, 'readFile').mockResolvedValue(fileContent);

      const result = await io.readFile(filePath);

      expect(result).toBe(fileContent);
      expect(fs.promises.readFile).toHaveBeenCalledWith(filePath, 'utf-8');
    });
  });
});
