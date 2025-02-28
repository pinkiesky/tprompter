import { Service } from 'typedi';
import { AppConfigData, AppConfigDataValuesTransformers } from './AppConfigData.js';
import { ArgumentsCamelCase } from 'yargs';

@Service()
export class CLIArgumentsToAppConfigMapper {
  constructor() {}

  map(args: ArgumentsCamelCase): Partial<AppConfigData> {
    return {
      quiet: AppConfigDataValuesTransformers.quiet(args.quiet, false),
      verbose: AppConfigDataValuesTransformers.verbose(args.verbose, false),
    };
  }
}
