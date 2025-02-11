import { fork } from 'node:child_process';
import path from 'node:path';
import { StdinDataReader } from './StdinDataReader.js';

/**
 * Implementation of the StdinDataReader interface that reads data from the standard input.
 * The reason why we need StdinDataReader is that Jest doen't support bloody `import.meta.url`
 * (I was forced to ESM I swear)
 * So we need to mock the `readData` method in tests and avoid any mention of `import.meta.url` and thus mention of this file.
 */
export class StdinDataReaderImpl implements StdinDataReader {
  readData(placeholder = 'Input required'): Promise<string> {
    return new Promise((resolve, reject) => {
      console.log(`${placeholder} (Press CTRL+D to finish):`);

      const dirname = path.dirname(new URL(import.meta.url).pathname);
      const childPath = path.resolve(dirname, 'readData.process.js');

      const child = fork(childPath, [], {
        stdio: ['inherit', 'pipe', 'pipe', 'ipc'],
      });

      let errorOutput = '';
      child.stderr!.on('data', (chunk) => {
        errorOutput += chunk;
      });

      child.on('message', (message: { data: string }) => {
        resolve(message.data);
      });

      child.on('close', (code) => {
        if (code !== 0) {
          console.error(`Child process exited with code ${code}`);
          console.error('Error output:', errorOutput);
          reject(new Error(`Child process exited with code ${code}`));
        }
      });

      child.on('error', (err) => {
        console.error('Failed to start child process:', err);
        reject(err);
      });
    });
  }
}
