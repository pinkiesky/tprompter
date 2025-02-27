import { Container } from 'typedi';
import { LoggerService } from '../logger/index.js';

export function logDuration() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const rootLogger = Container.get(LoggerService);
    const logger = rootLogger.child('timings');

    const originalMethod = descriptor.value;
    descriptor.value = function (...args: unknown[]) {
      const start = Date.now();

      const result = originalMethod.apply(this, args);
      if (result instanceof Promise) {
        return result
          .then((res) => {
            const duration = Date.now() - start;
            logger.debug(`Execution of ${propertyKey} took ${duration}ms`);
            return res;
          })
          .catch((err) => {
            const duration = Date.now() - start;
            logger.debug(`Execution of ${propertyKey} took ${duration}ms`);
            throw err;
          });
      }

      const duration = Date.now() - start;
      logger.debug(`Execution of ${propertyKey} took ${duration}ms`);
      return result;
    };
    return descriptor;
  };
}
