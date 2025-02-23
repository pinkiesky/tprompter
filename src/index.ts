#!/usr/bin/env node

import 'reflect-metadata';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { Container } from 'typedi';
import { AvailableActions } from './actions/Actions.js';
import { MainController } from './MainController.js';
import { setupContainer } from './di/index.js';
import { LoggerService } from './logger/index.js';
import { BUILD_INFO } from './buildInfo.js';

const afterDescription = {
  describe: 'What to do after generating the prompt',
  choices: Object.values(AvailableActions) as AvailableActions[],
  default: AvailableActions.COPY_TO_CLIPBOARD,
};

async function main(): Promise<void> {
  const ctrl = Container.get(MainController);
  const rootLogger = Container.get(LoggerService);

  const availabePrompts: string[] = await ctrl.listPrompts();
  const availabeAssets: string[] = await ctrl.listAssets();

  const params = await yargs(hideBin(process.argv))
    .scriptName('tprompter')
    .boolean('verbose')
    .alias('v', 'verbose')
    .describe('verbose', 'Increase verbosity')
    .boolean('quiet')
    .alias('q', 'quiet')
    .describe('quiet', 'Do not output anything')
    .usage('$0 <command> [options]')
    .command(
      'list',
      'List available prompts',
      () => {},
      () => {
        availabePrompts.forEach((p) => console.log(p));
      },
    )
    .command(
      'generate <nameOrFile>',
      'Generate a prompt',
      (yargs) => {
        return yargs
          .positional('nameOrFile', {
            describe: 'Name of the prompt or path to the file with the prompt',
            demandOption: true,
            type: 'string',
            choices: availabePrompts,
          })
          .option('after', afterDescription);
      },
      ({ nameOrFile, after }) => {
        ctrl.generateAndEvaluate(nameOrFile, after).catch((err) => rootLogger.root.error(err));
      },
    )
    .command(
      'prompt <subcommand>',
      'Manage prompts',
      (yargs) => {
        return yargs
          .command(
            'list',
            'List available prompts',
            () => {},
            () => {
              availabePrompts.forEach((p) => console.log(p));
            },
          )
          .command(
            'install <name> [filepath]',
            'Install a prompt from a file',
            (yargs) => {
              return yargs
                .positional('name', {
                  describe: 'Name of the prompt',
                  type: 'string',
                  demandOption: true,
                })
                .positional('filepath', {
                  describe: 'Path to the file with the prompt',
                  type: 'string',
                  demandOption: false,
                });
            },
            ({ name, filepath }) => {
              ctrl
                .installPrompt(name, filepath)
                .then(() => rootLogger.root.info('Prompt installed'))
                .catch((err) => rootLogger.root.error(err));
            },
          )
          .command(
            'uninstall <name>',
            'Uninstall a prompt',
            (yargs) => {
              return yargs.positional('name', {
                describe: 'Name of the prompt',
                type: 'string',
                demandOption: true,
                choices: availabePrompts,
              });
            },
            ({ name }) => {
              ctrl
                .uninstallPrompt(name)
                .then(() => rootLogger.root.info('Prompt uninstalled'))
                .catch((err) => rootLogger.root.error(err));
            },
          )
          .command(
            'open_folder',
            'Open the folder with external prompts',
            () => {},
            () => {
              ctrl.openPromptsFolder().catch((err) => rootLogger.root.error(err));
            },
          );
      },
      () => {},
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
        ctrl
          .getFromArchiveByIndexAndEvaluate(index, after)
          .catch((err) => rootLogger.root.error(err));
      },
    )
    .command(
      'version',
      'Show version',
      () => {},
      () => {
        rootLogger.root.info(`Version: ${BUILD_INFO.version} (${BUILD_INFO.gitHash})`);
      },
    )
    .command(
      'assets <subcommand>',
      'List and get assets',
      (yargs) => {
        return yargs
          .command(
            'list',
            'List available assets',
            () => {},
            () => {
              availabeAssets.forEach((a) => console.log(a));
            },
          )
          .command(
            'get <name>',
            'Get an asset',
            (yargs) => {
              return yargs.positional('name', {
                describe: 'Name of the asset',
                type: 'string',
                demandOption: true,
                choices: availabeAssets,
              });
            },
            ({ name }) => {
              ctrl
                .getAsset(name)
                .then((content) => console.log(content))
                .catch((err) => rootLogger.root.error(err));
            },
          );
      },
      async () => {},
    )
    .completion()
    .help()
    .demandCommand(1, 'You need at least one command before moving on')
    .version(false)
    .strict()
    .parse();

  if (params.verbose) {
    rootLogger.setLevel('debug');
  } else if (params.quiet) {
    rootLogger.setLevel('error');
  } else {
    rootLogger.setLevel('info');
  }
}

setupContainer()
  .then(main)
  .catch((err) => console.error(err));
