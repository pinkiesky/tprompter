#!/usr/bin/env node

import 'reflect-metadata';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { Container } from 'typedi';
import { AvailableActions } from './actions/Actions.js';
import { MainController } from './MainController.js';
import { setupContainer } from './di/index.js';

const afterDescription = {
  describe: 'What to do after generating the prompt',
  choices: Object.values(AvailableActions) as AvailableActions[],
  default: AvailableActions.COPY_TO_CLIPBOARD,
};

function main(): void {
  const ctrl = Container.get(MainController);

  // Build the CLI with yargs
  yargs(hideBin(process.argv))
    .scriptName('pprompter')
    .usage('$0 <command> [options]')
    .command(
      'list',
      'List available prompts',
      () => {},
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
          .option('after', afterDescription);
      },
      ({ name, after }) => {
        ctrl.generateAndEvaluate(name, after).catch((err) => console.error(err));
      },
    )
    .command(
      'archive <index>',
      'Archive a prompt',
      (yargs) => {
        return yargs
          .positional('index', {
            describe: 'Index of the prompt to archive',
            type: 'number',
            demandOption: true,
          })
          .option('after', afterDescription);
      },
      ({ index, after }) => {
        ctrl.getFromArchiveByIndexAndEvaluate(index, after).catch((err) => console.error(err));
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
