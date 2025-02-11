import 'reflect-metadata';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { Container } from 'typedi';
import { PromptsCatalog } from './prompts/PromptsCatalog.js';
import { Actions, AvailableActions } from './actions/Actions.js';

async function setupContainer(): Promise<void> {
}

function main(): void {
  const catalog = Container.get(PromptsCatalog);
  const actions = Container.get(Actions);

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
        catalog.listPrompts().then((prompts) => {
          prompts.forEach((p) => console.log(p));
        });
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
      async ({ name, after }) => {
        const prompt = await catalog.getPrompt(name);
        const content = await prompt.generate();

        await actions.evaluate(after as AvailableActions, content);
      },
    )
    .help()
    .demandCommand(1, 'You need at least one command before moving on')
    .strict()
    .parse();
}

setupContainer().then(main).catch((err) => console.error(err));
