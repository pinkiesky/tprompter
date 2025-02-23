# tprompter Fish completion
#
# Installation:
#   Save this file as ~/.config/fish/completions/tprompter.fish
#   or use the following command:
#   tprompter fish > ~/.config/fish/completions/tprompter.fish
#
function __fish_tprompter_yargs_completions
    # Get all tokens on the command line (including the current partial token)
    set -l tokens (commandline -opc)
    set -l current (commandline -ct)
    # Ask tprompter to generate completions based on the current arguments
    tprompter --get-yargs-completions $tokens $current
end

complete \
    -c tprompter \
    -n '__fish_is_first_arg' \
    -f \
    -a "(tprompter --get-yargs-completions)" \
    -d "Subcommand"

# Register the completions for the tprompter command
complete -c tprompter -a '(__fish_tprompter_yargs_completions)' -f
