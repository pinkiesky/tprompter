import { Service } from 'typedi';
import { AppConfigData } from './AppConfigData.js';
import { ArgumentsCamelCase } from 'yargs';

@Service()
export class CLIArgumentsToAppConfigMapper {
  constructor() {}

  map(args: ArgumentsCamelCase): Partial<AppConfigData> {
    return {
      quiet: Boolean(args.quiet),
      verbose: Boolean(args.verbose),
    };
  }
}
