import 'reflect-metadata';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { Container } from 'typedi';
import { AvailableActions } from './actions/Actions.js';
import { StdinDataReader } from './utils/StdinDataReader.js';
import { StdinDataReaderImpl } from './utils/StdinDataReader.impl.js';
import { MainController } from './MainController.js';

async function setupContainer(): Promise<void> {
  Container.set(StdinDataReader, new StdinDataReaderImpl());
}

function main(): void {
  const ctrl = Container.get(MainController);

  // Build the CLI with yargs
  yargs(hideBin(process.argv))
    .scriptName('pprompter')
    .usage('$0 <command> [options]')
    .command(
      'list',
      'List available prompts',
      () => {
        /* No additional arguments for 'list' command */
      },
      () => {
        ctrl
          .listPrompts()
          .then((prompts) => {
            prompts.forEach((p) => console.log(p));
          })
          .catch((err) => console.error(err));
      },
    )
    .command(
      'generate <name>',
      'Generate a prompt',
      (yargs) => {
        return yargs
          .positional('name', {
            describe: 'Name of the prompt',
            type: 'string',
            demandOption: true,
          })
          .option('after', {
            describe: 'What to do after generating the prompt',
            choices: Object.values(AvailableActions) as AvailableActions[],
            default: AvailableActions.COPY_TO_CLIPBOARD,
          });
      },
      ({ name, after }) => {
        ctrl.generateAndEvaluate(name, after).catch((err) => console.error(err));
      },
    )
    .help()
    .demandCommand(1, 'You need at least one command before moving on')
    .strict()
    .parse();
}

setupContainer()
  .then(main)
  .catch((err) => console.error(err));
