import { fork } from 'node:child_process';
import path from 'node:path';
import { ReadOptions, StdinDataReader } from './StdinDataReader.js';
import { InjectLogger } from '../logger/logger.decorator.js';
import { Logger } from '../logger/index.js';

/**
 * Implementation of the StdinDataReader interface that reads data from the standard input.
 * The reason why we need StdinDataReader is that Jest doen't support `import.meta.url`
 * So we need to mock the `readData` method in tests and avoid any mention of `import.meta.url` and thus mention of this file.
 */
export class StdinDataReaderImpl implements StdinDataReader {
  constructor(@InjectLogger(StdinDataReaderImpl) private logger: Logger) {}

  readData(placeholder = 'Input required', options: ReadOptions = {}): Promise<string> {
    if (process.stdin.isTTY && options.onlyPipe) {
      this.logger.debug('No data in stdin, skipping');
      return Promise.resolve('');
    }

    return new Promise((resolve, reject) => {
      if (process.stdin.isTTY) {
        console.log(`${placeholder} (Press CTRL+D to finish):`);
      }

      const dirname = path.dirname(decodeURI(new URL(import.meta.url).pathname));
      const childPath = path.resolve(dirname, 'readData.process.js');

      const child = fork(childPath, [], {
        stdio: ['inherit', 'pipe', 'pipe', 'ipc'],
      });

      let errorOutput = '';
      child.stderr!.on('data', (chunk) => {
        errorOutput += chunk;
      });

      child.on('message', (message: { data: string }) => {
        if (!message.data.endsWith('\n')) {
          process.stdout.write('\n');
        }

        resolve(message.data);
      });

      child.on('close', (code) => {
        if (code !== 0) {
          this.logger.error(`Child process exited with code ${code}`);
          this.logger.error(`Error output: ${errorOutput}`);

          reject(new Error(`Child process exited with code ${code}`));
        }
      });

      child.on('error', (err) => {
        this.logger.error(`Child process error: ${err}`);
        reject(err);
      });
    });
  }
}
