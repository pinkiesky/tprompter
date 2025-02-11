import http from 'node:http';

export function runDisposableServer(
  content: string,
  mbPort?: number,
): Promise<{
  server: http.Server;
  port: number;
  url: string;
}> {
  const port = mbPort ? mbPort : Math.floor(Math.random() * 50000) + 10000;

  const server = http.createServer(
    // @ts-ignore
    (req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.write(content);
      res.end();

      setImmediate(() => {
        server.close();
      });
    },
    { allowHalfOpen: true },
  );

  return new Promise((resolve, reject) => {
    let timeout: NodeJS.Timeout | null = null;

    server.on('error', (err) => {
      reject(err);
    });

    server.on('close', () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    });

    server.listen(port, () => {
      timeout = setTimeout(() => {
        server.close();
      }, 120000);

      resolve({
        server,
        port,
        url: `http://localhost:${port}`,
      });
    });
  });
}
