import { platform } from 'node:os';
import { spawn } from 'node:child_process';

export async function openFinder(path: string) {
  let cmd = ``;
  switch (platform().toLowerCase().replace(/[0-9]/g, ``)) {
    case `win`:
      cmd = `explorer`;
      break;
    case `linux`:
      cmd = `xdg-open`;
      break;
    case `darwin`:
      cmd = `open`;
      break;
  }

  return new Promise<void>((resolve, reject) => {
    const child = spawn(cmd, [path], { stdio: `inherit` });
    child.on(`error`, (err) => {
      reject(err);
    });

    child.on(`close`, (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Child process exited with code ${code}`));
      }
    });
  });
}
