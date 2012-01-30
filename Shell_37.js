/**
 *
 * jShell v0.0.1
 *
 * jShell is a general-purpose command line utility written in JavaScript.
 *
 * @author  Hassan C
 * @link    www.hassanc.co.uk
 */

/**
 *
 * jShell Style Guidelines
 *
 * A pre-message should always be bolded, and any text in quotation marks
 * should be italicized, as demonstrated below:
 *
 * *Error:* _'foobar'_ is invalid input.
 *
 */

/**
 * 
 * Todos: add a "code-mode" (decide on better name) wherein the preceding
 * symbol is a set of ellipses, rather than a greater-than sign.
 * - Using jToken/jParser, create a small interface [.....] for a
 *   rudimentary scripting language to be tested and evaluated.
 */

// General utility methods:
// A modified/simplified version of the PHP explode function from phpjs.org
String.prototype.explode = function(delimiter, limit) {
    var splitted = this.split(delimiter);
    var partA = splitted.splice(0, limit - 1);
    var partB = splitted.join(delimiter);
    partA.push(partB);
    return partA;
};

// Set up some basic aliases to make things shorter.
var console = $('#console');
var output = $('#output');


// Large blocks of text are kept here inside this object.
// Text within curly brackets will be replaced with appropriate data.
var text = {
    about: '<b>jShell v0.0.1</b>\n<b>Author:</b> Hassan C (www.hassanc.co.uk)\n<b>Information:</b> jShell is a general-purpose command line utility written in JavaScript. It is still in the very early stages of development and certain features may be shifted around before it is fully complete.',
    help: '<b>Command list:</b> {commands}\n<b>Information:</b> Type a question mark as the parameter of a command to view instructions for it. For example, <i>alias ?</i> will display specific help information for the <i>alias</i> command.',
    
    commands: {
        about: '<b>Usage:</b> <i>about</i>\n<b>Information:</b> The <i>about</i> command displays information about jShell, such as the current version number, the author\'s name and website as well as a general description of what jShell is.',
        alias: '<b>Usage:</b> <i>alias [alias-name] [command(s)-name]</i>\n<b>Options:</b> <i>-[l]ist, -[r]emove</i>\n<b>Information:</b> The <i>alias</i> command can be used to bind a command or a set of commands (with or without parameters and their respective values) to a new command of an arbitrary name.\n<b>Example:</b> <i>alias write echo</i> would allow you to type <i>write hello world</i> and have it output the same as if you were to type <i>echo hello world</i>.',
        clear: '<b>Usage:</b> <i>clear</i>\n<b>Information:</b> The <i>clear</i> command clears the contents of the output container.',
        echo: '<b>Usage:</b> <i>echo [string]</i>\n<b>Information:</b> The <i>echo</i> command appends a string to the output container.'
    },
    
    notices: {
        aliased: '<b>Notice:</b> Bound alias <i>{alias}</i> to command <i>{command}</i>.',
        deletedAlias: '<b>Notice:</b> Deleted and unbound alias <i>{alias}</i>.',
        clearedStack: '<b>Notice:</b> Emptied shell stack and reset index.'
    },
    
    errors: {
        input: '<b>Error:</b> <i>{input}</i> is invalid input.',
        noCommand: '<b>Error:</b> The command <i>{command}</i> does not exist.',
        noAlias: '<b>Error:</b> No such alias exists.'
    }
};

function Shell() {
    
    // The command stack and its current index.
    this.stack = {
        list: [],
        index: 0
    };
    
    // The file list.
    this.files = {};
    
    // Aliases:
    // These are user-specified keywords bound to command(s).
    this.aliases = {};
    
    // Methods executed when commands are entered.
    this.command = {
        list: ['about', 'alias', 'clear', 'echo', 'file', 'help', 'hist'],
        run: {
            about: function() {
                Shell.write(text.about);
            },
            alias: function(args) {
                if (!args) {
                    return;
                }
                
                args = args.explode(' ', 2);
                switch (args[0]) {
                    case '-l':
                    case '-list':
                        if (Object.keys(Shell.aliases).length === 0) {
                            Shell.write('No aliases have been bound.');
                            return;
                        }
                        
                        var aliases = [];
                        for (var alias in Shell.aliases) {
                            aliases.push(alias + ': ' + Shell.aliases[alias]);
                        }
                        Shell.write(aliases.join(', '));
                    break;
                        
                    case '-r':
                    case '-remove':
                        if (!Shell.aliases.hasOwnProperty(args[1])) {
                            Shell.write(text.errors.noAlias);
                            return;
                        }
                        
                        delete Shell.aliases[args[1]];
                        Shell.write(text.notices.deletedAlias.replace(
                            '{alias}', args[1]
                        ));
                    break;
                    
                    default:
                        var command = args[1].split(' ')[0];
                        if (!Shell.command.run.hasOwnProperty(command)) {
                            Shell.write(text.errors.noCommand.replace(
                                '{command}', command
                            ));
                            return;
                        }
                        
                        Shell.aliases[args[0]] = args[1];
                        Shell.write(text.notices.aliased.replace(
                            '{alias}', args[0]).replace(
                            '{command}', command
                        ));
                    break;
                }
            },
            clear: function() {
                output.html(null);
            },
            echo: function(string) {
                if (!string) {
                    return;
                }
                
                Shell.write(string);
            },
            file: function(args) {
                args = args.split(' ');
                
                switch (args[0]) {
                    case '-n':
                    case '-new':
                        Shell.files[args[1]] = '';
                    break;
                }
            },
            help: function() {
                Shell.write(text.help.replace(
                    '{commands}', Shell.command.list.join(', ')
                ));
            },
            hist: function(args) {
                if (args == '-c' || args == '-clear') {
                    Shell.stack.list = [];
                    Shell.stack.index  = 0;
                    Shell.write(text.notices.clearedStack);
                    return;
                }
                
                Shell.write('<b>Stack:</b> ' + Shell.stack.list.join(', ') +
                            '\n<b>Index:</b> ' + Shell.stack.index);
            }
        }
    };
    
    // Methods executed when invalid input is entered.
    this.error = {
        input: function(input) {
            input = input.trim();
            input = (input.length > 16 ? input.substr(0, 16) +
                     '...' : input);
            
            return text.errors.input.replace(
                '{input}', input
            );
        }
    };
    
    // Appends a string to the output container.
    this.write = function(value) {
        output.append('> ' + value + '\n');
    };
    
    // The brain of jShell.
    this.run = function(rawCommand) {
        rawCommand = rawCommand.trim();
        
        // command[0] is the command itself.
        // And command[1] is the rest (parameters et cetera.)
        var command = rawCommand.toLowerCase().explode(' ', 2);
        
        if (!command[0]) {
            return;
        }
        
        // Push onto stack and reset stack index.
        this.stack.list.push(rawCommand);
        this.stack.index = this.stack.list.length;
        
        // If it is not a valid command, display an error.
        if (!this.command.run.hasOwnProperty(command[0]) &&
           !this.aliases.hasOwnProperty(command[0])) {
            
            this.write(this.error.input(rawCommand));
            return;
        }
        
        // The command entered is an alias of another command (or set of
        // commands). This may include parameters and their respective
        // values.
        if (this.aliases.hasOwnProperty(command[0])) {
            // command[0] == write -> val(echo hello world)
            // command[1] == hello world
            
            // exptd outp == hello worldhello world
            // 
            if (this.aliases[command[0]].split(' ').length > 1) {
            }
            
            Shell.command.run[this.aliases[command[0]]](command[1]);
            return;
        }
        
        // A question mark has been entered as the parameter/argument.
        // Thus, we display the help page for the command.
        if (command[1] === '?') {
            Shell.write(text.commands[command[0]]);
            return;
        }
        
        Shell.command.run[command[0]](command[1]);
    };
    
}

var Shell = new Shell();

console.focus();
console.keydown(function(event) {
    
    var key = event.keyCode;
    
    // The up arrow key has been pressed:
    // Go to the previous available command in the stack.
    if (key == 38) {
        
        // Prevent caret from moving to the beginning.
        event.preventDefault();
        
        if (Shell.stack.index === 0) {
            return;
        }
        
        Shell.stack.index--;
        console.val(Shell.stack.list[Shell.stack.index]);
    }
    
    // The down arrow key has been pressed:
    // Go to the next available command in the stack.
    if (key == 40 && Shell.stack.index < Shell.stack.list.length - 1) {
        Shell.stack.index++;
        console.val(Shell.stack.list[Shell.stack.index]);
    }
    
    // The enter key has been pressed:
    if (key == 13) {
        
        // Execute the command(s) entered.
        var consoleVal = console.val().split(';');
        for (command in consoleVal) {
            Shell.run(consoleVal[command]);
        }
        
        console.val(null);
        
        // Scroll to the bottom of the output container.
        output.scrollTop(output[0].scrollHeight);
    }
    
});