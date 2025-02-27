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
import { AppConfig } from './config/AppConfig.js';
import { AppConfigDataKeys, AppConfigDataValues } from './config/AppConfigData.js';
import { LLMService } from './llm/LLMService.js';
import { inspect } from 'node:util';
import { PromptTooLongError } from './llm/errors/PromptTooLongError.js';

const afterDescription = {
  describe: 'What to do after generating the prompt',
  choices: Object.values(AvailableActions) as AvailableActions[],
  default: AvailableActions.COPY_TO_CLIPBOARD,
};

async function main(): Promise<void> {
  const configService = Container.get(AppConfig);
  await configService.loadPersistent();

  const ctrl = Container.get(MainController);
  const rootLogger = Container.get(LoggerService);

  const llmService = Container.get(LLMService);

  const availableTemplates: string[] = await ctrl.listTemplates();
  const availabeAssets: string[] = await ctrl.listAssets();
  const availableModels: string[] = await llmService.listModels();

  const parser = yargs(hideBin(process.argv))
    .scriptName('tprompter')
    .boolean('verbose')
    .alias('v', 'verbose')
    .default('verbose', false)
    .describe('verbose', 'Increase verbosity')
    .boolean('quiet')
    .default('quiet', false)
    .alias('q', 'quiet')
    .describe('quiet', 'Do not output anything')
    .usage('$0 <command> [options]')
    .command(
      'list',
      'List available templates',
      () => {},
      () => {
        console.log('list!');
        availableTemplates.forEach((p) => console.log(p));
      },
    )
    .command(
      'generate <templateNameOrFile>',
      'Generate a prompt',
      (yargs) => {
        return yargs
          .positional('templateNameOrFile', {
            describe: 'Name of the prompt or path to the file with the prompt',
            demandOption: true,
            type: 'string',
            choices: availableTemplates,
          })
          .option('after', afterDescription);
      },
      async ({ templateNameOrFile, after }) => {
        try {
          await ctrl.generateAndEvaluate(templateNameOrFile, after);
        } catch (err) {
          rootLogger.root.error('Unable to generate', { err: inspect(err) });
        }
      },
    )
    .command(
      'template <subcommand>',
      'Manage templates',
      (yargs) => {
        return yargs
          .command(
            'list',
            'List available templates',
            () => {},
            () => {
              availableTemplates.forEach((p) => console.log(p));
            },
          )
          .command(
            'install <name> [filepath]',
            'Install a template from a file',
            (yargs) => {
              return yargs
                .positional('name', {
                  describe: 'Name of the template',
                  type: 'string',
                  demandOption: true,
                })
                .positional('filepath', {
                  describe: 'Path to the file with the template',
                  type: 'string',
                  demandOption: false,
                });
            },
            ({ name, filepath }) => {
              ctrl
                .installTemplate(name, filepath)
                .then(() => rootLogger.root.info('Template installed'))
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
                choices: availableTemplates,
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
            'Open the folder with external templates',
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
      'Archive of previously generated prompt',
      (yargs) => {
        return yargs
          .positional('index', {
            describe: 'Index of the prompt in the archive (0 is the last one)',
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
    .command(
      'ask <template>',
      'Ask a question',
      (yargs) => {
        return yargs
          .positional('template', {
            describe: 'Name of the template',
            type: 'string',
            demandOption: true,
            choices: availableTemplates,
          })
          .option('model', {
            describe: 'Model to use',
            type: 'string',
            choices: availableModels,
          });
      },
      async ({ template, model }) => {
        try {
          const prompt = await ctrl.ask(template, model);
          console.log(prompt);
        } catch (err) {
          if (err instanceof PromptTooLongError) {
            rootLogger.root.error(`Prompt is too long: ${err.length} > ${err.maxTokens}`);
          } else {
            rootLogger.root.error('Unable to ask', { err: inspect(err) });
          }
        }
      },
    )
    .command(
      'config <configKey> [configValue]',
      'Show or set current configuration',
      (yargs) => {
        return yargs
          .positional('configKey', {
            describe: 'Configuration key',
            type: 'string',
            choices: configService.getAvailableConfigKeys(),
            demandOption: true,
          })
          .positional('configValue', {
            describe: 'Configuration value',
            type: 'string',
          })
          .option('remove', {
            describe: 'Delete the configuration value',
            type: 'boolean',
            default: false,
          });
      },
      ({ configKey, configValue, remove }) => {
        if (remove) {
          configService
            .deletePersistentValue(configKey as keyof AppConfigDataValues)
            .then(() => rootLogger.root.info('Config value deleted'))
            .catch((err) => rootLogger.root.error(err));

          return;
        }

        if (configValue) {
          configService
            .setPersistentValue(configKey as keyof AppConfigDataValues, configValue)
            .then(() => rootLogger.root.info('Config value set'))
            .catch((err) => rootLogger.root.error(err));
        } else {
          const value = configService.getConfig()[configKey as keyof AppConfigDataValues];
          if (typeof value === 'undefined') {
            rootLogger.root.error('Config value not set');
          } else {
            console.log(value);
          }
        }
      },
    )
    .completion()
    .help()
    .demandCommand(1, 'You need at least one command before moving on')
    .version(false)
    .strict()
    .middleware(async (argv) => {
      if (argv.verbose) {
        rootLogger.setLevel('debug');
      } else if (argv.quiet) {
        rootLogger.setLevel('error');
      } else {
        rootLogger.setLevel('info');
      }

      await configService.applyCLIArguments(argv);
    });

  await parser.parse();
}

setupContainer()
  .then(main)
  .catch((err) => console.error(err));
