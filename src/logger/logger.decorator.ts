import { Constructable, Container } from 'typedi';
import { LoggerService } from './index.js';

export function InjectLogger(child?: string | Function): Function {
  return function (object: Object, propertyName: string, index?: number) {
    const rootLogger = Container.get(LoggerService);

    const name = typeof child === 'function' ? child.name : child;
    Container.registerHandler({
      object: object as Constructable<unknown>,
      propertyName,
      index,
      value: () => (name ? rootLogger.child(name) : rootLogger.root),
    });
  };
}
