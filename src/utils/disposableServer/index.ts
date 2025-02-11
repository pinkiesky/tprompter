import http from 'node:http';

const WAIT_BEFORE_CLOSE_MS = 120000; // 2 minutes

export function runDisposableServer(
  content: string,
  preferredPort?: number,
): Promise<{
  server: http.Server;
  port: number;
  url: string;
}> {
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

    server.listen(preferredPort || 0, () => {
      const actualPort = (server.address() as any).port;

      timeout = setTimeout(() => {
        server.close();
      }, WAIT_BEFORE_CLOSE_MS);

      resolve({
        server,
        port: actualPort,
        url: `http://localhost:${actualPort}`,
      });
    });
  });
}
