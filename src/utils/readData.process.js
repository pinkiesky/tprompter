import process from 'node:process';

function runChild() {  
  process.stdin.setEncoding('utf8');

  let data = '';

  process.stdin.on('data', (chunk) => {
    data += chunk;
  });

  // When the user presses Ctrl+D, Node sees EOF, the 'end' event fires
  process.stdin.on('end', () => {
    process.send({ data }, () => {
      process.exit(0);
    });
  });
}

runChild();
