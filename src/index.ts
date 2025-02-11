import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { PromptsCatalog } from './prompts';

function main(): void {
  const catalog = new PromptsCatalog();

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
            choices: ['open', 'clipboard', 'print'] as const,
            default: 'clipboard',
          });
      },
      async ({ name, after }) => {
        const prompt = await catalog.getPrompt(name);
        const content = await prompt.generate();

        console.log(content);
      },
    )
    .help()
    .demandCommand(1, 'You need at least one command before moving on')
    .strict()
    .parse();
}

main();
