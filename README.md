# tprompter

> Work in Progress

tprompter is a powerful CLI tool designed to streamline the generation of custom GPT prompts for software development tasks.

## Goal of the project

I tried to generate prompts for GPTs manually. The flow was the following:

1. I wrote a prompt for review/unit-tests/etc. in Sublime Text;
2. I copied all the source code I needed from my IDE to the Sublime;
3. I finished the prompt and copied it to the ChatGPT page;
4. I hit the Enter.

I wanted to automate this process and make it more flexible. So I created `tprompter`.

The flow with `tprompter` is the following:

1. I run `tprompter generate <template_name> --after=chatgpt`;
2. I drag and drop files I need to the terminal (or copy the part of the code I need, both way are acceptable);
3. I press Ctrl+D to finish the input for the template (source code for review/unit test examples/git diff/etc).

`tprompter` will generate a prompt based on the source code (it resolves and includes the contents of the provided file paths) I provided and open the ChatGPT page with the prompt right on the page.

```bash
~/P/tprompter (main|✚1) $ tprompter generate code_review --after=chatgpt
Enter the source code files: (Press CTRL+D to finish):
'/Users/pinkiesky/Projects/tprompter/'

info:    Tokens count: 17705
info:    Executing action: chatgpt

~/P/tprompter (main|✚1) $ git diff | tprompter generate commit_message --after=print
info:    Tokens count: 1875
info:    Executing action: print
...
```

## Build and install

### From npm registry

```bash
npm install -g tprompter
```

### From source code

```bash
# remove previous version && build && install
npm uninstall -g . && npm run build && npm install -g .
```

## Features

- Prompt generation based on templates and on your source code
- Templates catalog with built-in and custom templates
- Zero configuration setup
- Built-in archive to access previous prompts
- Automatically pass the prompt to the ChatGPT page
- Shell completion for easy usage
  - [x] bash
  - [x] zsh
  - [x] fish
- Shell pipes support (`git diff | tprompter generate commit_message --after=chatgpt`)

## Usage

### Help

```bash
$ tprompter --help
tprompter <command> [options]

Commands:
  tprompter list                   List available prompts
  tprompter generate <nameOrFile>  Generate a prompt
  tprompter prompt <subcommand>    Manage prompts
  tprompter archive <index>        Archive a prompt
  tprompter version                Show version
  tprompter assets <subcommand>    List and get assets
  tprompter completion             generate completion script

Options:
      --help     Show help                                             [boolean]
  -v, --verbose  Increase verbosity                                    [boolean]
  -q, --quiet    Do not output anything                                [boolean]
```

### List available prompt templates

```bash
tprompter list
# or
tprompter prompt list
```

### Generate a prompt by template name

```bash
tprompter generate <template> --after=<action>
# tprompter generate code_review --after=chatgpt
```

### Generate a prompt by file

```bash
tprompter generate <file_path> --after=<action>
# tprompter generate /path/to/file.md --after=print
```

### Get the last prompt from archive

```bash
tprompter archive 0 --after=<action>
# tprompter archive 0 --after=copy
```

### Install custom template (from file)

```bash
tprompter prompt install <name> <filepath>
# tprompter prompt install code_review /path/to/file.md

# or
cat /path/to/file.md | tprompter prompt install code_review
```

### Install custom template (from URL)

```bash
curl <url> | tprompter prompt install <name>
# curl -s https://raw.githubusercontent.com/pinkiesky/tprompter/main/prompts/code_review.md | tprompter prompt install code_review
```

### Uninstall custom template

```bash
tprompter prompt uninstall <name>
# tprompter prompt uninstall code_review
```

### Open the templates folder in the default file manager

```bash
tprompter prompt open_folder
```

## FAQ

### What actions are available?

For `--after` in the `generate` and `archive` commands you can use the following actions:

- [x] `print` - print the prompt to the terminal
- [x] `chatgpt` - open the ChatGPT page with the prompt
- [x] `copy` - copy the prompt to the clipboard
- [ ] `edit` - open the prompt in the default editor
- [ ] `get_response` - get the response from the ChatGPT API and print it to the terminal

### How "Open in ChatGPT" works?

[ChatGPT](https://chatgpt.com/) webapp has no option to open a prompt from the URL. So I used a workaround: I open the ChatGPT page and then I inject the prompt into the page using JavaScript. The JavaScript code should be installed in an extension like [Tampermonkey](https://www.tampermonkey.net/).

The script is simple and safe. It just injects the prompt into the page and clicks the "Enter" button.

But how the script knows what to inject? The `tprompter` generates a prompt and starts a "disposable http-server" that returns the prompt content on any request. The script gets the prompt content from the server and injects it into the ChatGPT page. The server is stopped automaticly after the prompt is injected. And there is no need to worry about a server's port, it is random and changes every time.

### How to install the injection script?

1. Install the [Tampermonkey](https://www.tampermonkey.net/) extension for your browser (or choose any extension you like);
2. Open the Tampermonkey dashboard;
3. Create a new script;
4. Copy the output of the following command and paste it into the script editor

```bash
tprompter assets get chatgptloader
```

The script content is straightforward, so you can check easely it before installing.

### How to install shell completion (bash/zsh)?

```bash
tprompter completion >> ~/.bashrc
```

Do not forget to restart the terminal or run `source ~/.bashrc` after the installation.

### How to install shell completion (fish)?

```bash
tprompter assets get fish > ~/.config/fish/completions/tprompter.fish
```

Do not forget to restart the terminal.
