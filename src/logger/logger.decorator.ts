import { Constructable, Container } from 'typedi';
import { LoggerService } from './index.js';

export function InjectLogger(childName?: string): Function {
  return function (object: Object, propertyName: string, index?: number) {
    const rootLogger = Container.get(LoggerService);

    Container.registerHandler({
      object: object as Constructable<unknown>,
      propertyName,
      index,
      value: () => (childName ? rootLogger.child(childName) : rootLogger.root),
    });
  };
}
