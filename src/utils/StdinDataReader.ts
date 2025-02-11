import { fork } from 'child_process';
import path from 'path';
import { Service } from 'typedi';

@Service()
export class StdinDataReader {
  readData(placeholder = 'Input required'): Promise<string> {
    return new Promise((resolve, reject) => {
      console.log(`${placeholder} (Press CTRL+D to finish):`);

      const childPath = path.resolve(__dirname, 'readData.process.js');

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
