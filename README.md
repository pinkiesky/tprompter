# tprompter

> Work in Progress

tprompter is a powerful CLI tool designed to streamline the generation of custom GPT prompts for software development tasks.

## Goal of the project

I tired to generate prompts for GPTs manually. The flow was the following:
1. I wrote a prompt for review/unit-tests/etc. in Sublime Text;
2. I copied all the source code I needed from my IDE to the Sublime;
3. I finish the prompt and copy it to the ChatGPT page;
4. I hit the Enter.

I wanted to automate this process and make it more flexible. So I created `tprompter`.

The flow with `tprompter` is the following:
1. I run `tprompter generate <prompt_name> --after=chatgpt`;
2. I drag and drop files I need to the terminal (or copy the part of the code I need, both way are acceptable);
3. I press Ctrl+D to finish the input.

`tprompter` will generate a prompt based on the source code (it will unwrap the file pathes) I provided and open the ChatGPT page with the prompt right on the page.

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

```
# remove previous version && build && install
npm uninstall -g . && npm run build && npm install -g .
```

## Features

- Prompt generation based on templates and on your source code
- Prompts catalog with build-in and custom prompts
- Zero configuration setup
- Build-in archive to access previous prompts
- Automaticly pass the prompt to the ChatGPT page
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

