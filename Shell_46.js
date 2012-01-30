/**
 * @name           jShell
 * @description    jShell is a general-purpose command line utility
 *                 written in JavaScript.
 * @version        1.0.0beta (15JAN2011)
 * @author         Hassan C
 * @link           www.hassanc.co.uk
 *
 *
 * jShell Style Guidelines
 *
 * A "pre-message" should always be bolded, and any text in quotation marks
 * should be italicized, as shown below:
 *
 * *Error:* _'foobar'_ is invalid input.
 *
 * 
 * @todo:
 * - Add a "code-mode" (decide on better name) wherein the preceding
 *   symbol is a set of ellipses, rather than a greater-than sign.
 *
 * - Using jToken/jParser, create a small interface [.....] for a
 *   rudimentary scripting language to be tested and evaluated.
 *
 * - Refactor often.
 */

// Large blocks of text are kept here inside this object.
// Text within curly brackets will be replaced with appropriate data.
var text = {
    about: '<b>jShell v1.0.0beta</b>\n<b>Author:</b> Hassan C (www.hassanc.co.uk)\n<b>Information:</b> jShell is a general-purpose command line utility written in JavaScript.',
    help: '<b>Command list:</b> {commands}\n<b>Information:</b> Type a question mark or <i>help</i> as the parameter of a command to view instructions for it. For example, <i>alias ?</i> and <i>alias help</i> will both display specific help information for the <i>alias</i> command.',
    history: '<b>Stack:</b> {stack}\n<b>Index:</b> {index}',

    commands: {
        about: '<b>Usage:</b> <i>about</i>\n<b>Information:</b> The <i>about</i> command displays information about jShell, such as the current version number, the author\'s name and website, and as a general description of what jShell is.',
        alias: '<b>Usage:</b> <i>alias [alias-name] [command(s)-name]</i>\n<b>Options:</b> <i>-[l]ist, -[r]emove</i>\n<b>Information:</b> The <i>alias</i> command can be used to bind a command or a set of commands (with or without parameters and their respective values) to a new command of an arbitrary name.\n<b>Example:</b> <i>alias write echo</i> would allow you to type <i>write hello world</i> and have it output the same as if you were to type <i>echo hello world</i>.',
        clear: '<b>Usage:</b> <i>clear</i>\n<b>Information:</b> The <i>clear</i> command clears the contents of the output container.',
        echo: '<b>Usage:</b> <i>echo [string]</i>\n<b>Information:</b> The <i>echo</i> command appends a given string to the output container.',
        file: '<b>Usage:</b> <i>file -[option] ([file-name]) ([file-data])</i>\n<b>Options:</b> <i>-[l]ist, -[n]ew, -[a]ppend, -[g]et, -[r]emove</i>\n<b>Information:</b> The <i>file</i> command allows you to perform basic file-related tasks. \n<b>Example:</b> <i>file -new message.txt hello world</i> would create a new file under the name <i>message.txt</i> and set its contents to <i>hello world</i>. The contents would then be able to be read using <i>file -get message.txt</i>.',
        help: '<b>Usage:</b> <i>help</i>\n<b>Information:</b> The <i>help</i> command displays a list of all commands that can be used within jShell, as well as other helpful information.',
        hist: '<b>Usage:</b> <i>hist -[option]</i>\n<b>Options:</b> <i>-[c]lear</i>\n<b>Information:</b> The <i>hist</i> command can be used to view the current stack index, and all commands that have been entered into jShell prior to the most recent <i>hist -clear</i>. The stack index usually corresponds to the number of commands in the command stack. Whilst the console has focus, pressing the up and down arrow keys will decrement and increment the stack index respectively, and cycle through the commands in the command stack.'
    },

    notices: {
        aliased: '<b>Notice:</b> Bound alias <i>{alias}</i> to command <i>{command}</i>.',
        deletedAlias: '<b>Notice:</b> Deleted and unbound alias <i>{alias}</i>.',
        deletedFile: '<b>Notice:</b> Deleted file <i>{file}</i>.',
        clearedStack: '<b>Notice:</b> Emptied shell stack and reset index.',
        newFile: '<b>Notice:</b> Created new file <i>{file}</i> with <i>{size} bytes</i> of data.',
        appended: '<b>Notice:</b> Appended <i>{size} bytes</i> of data to file <i>{file}</i>.'
    },

    errors: {
        input: '<b>Error:</b> <i>{input}</i> is invalid input.',
        noCommand: '<b>Error:</b> The command <i>{command}</i> does not exist.',
        noBoundAliases: '<b>Error:</b> No aliases have been bound.',
        noAlias: '<b>Error:</b> No such alias exists.',
        noFiles: '<b>Error:</b> No files exist.',
        noFile: '<b>Error:</b> No such file exists.'
    }
};

// General utility methods:
// A modified/simplified version of the PHP explode function from phpjs.org
String.prototype.explode = function(delimiter, limit) {
    var splitted = this.split(delimiter);
    var partA = splitted.splice(0, limit - 1);
    var partB = splitted.join(delimiter);
    partA.push(partB);
    return partA;
};

// Aliases to make things shorter.
var console = $('#console');
var output = $('#output');

function Shell() {

    // The command stack and its current index.
    this.stack = {
        list: [],
        index: 0
    };

    // The file list.
    this.files = {};
    
    // Aliases: User-specified keywords bound to command(s).
    this.aliases = {};
    
    this.command = {
        list: ['about', 'alias', 'clear', 'echo', 'file', 'help', 'hist'],
        
        // Methods executed when commands are entered.
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
                        Shell.write(text.errors.noBoundAliases);
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
                    if (!args[1]) {
                        return;
                    }

                    if (!Shell.command.run.hasOwnProperty(args[1])) {
                        Shell.write(text.errors.noCommand.replace(
                            '{command}', args[1]
                        ));
                        return;
                    }

                    Shell.aliases[args[0]] = args[1];
                    
                    Shell.write(text.notices.aliased.replace(
                        '{alias}', args[0]).replace(
                        '{command}', args[1]
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
                args = args.explode(' ', 3);
                
                switch (args[0]) {
                case '-l':
                case '-list':
                    if (Object.keys(Shell.files).length === 0) {
                        Shell.write(text.errors.noFiles);
                        return;
                    }

                    var files = [];
                    for (var file in Shell.files) {
                        // Truncate file contents if it is over 16 chars.
                        var fileContents = (Shell.files[file].length > 16 ?
                                            Shell.files[file].substr(0, 16)
                                            + '...' : Shell.files[file]);
                        files.push(file + ': ' + fileContents + ' (' +
                                   Shell.files[file].length + ')');
                    }
                    
                    Shell.write(files.join(', '));
                    
                    break;
                case '-n':
                case '-new':
                    if (!args[1]) {
                        return;
                    }
                    
                    var fileNotice = text.notices.newFile.replace(
                        '{file}', args[1]).replace(
                        '{size}', args[2].length
                    );
                    
                    // If file already exists, change notice accordingly.
                    if (Shell.files.hasOwnProperty(args[1])) {
                        fileNotice = fileNotice.replace(
                            'Created new', 'Overwrote'
                        );
                    }
                                    
                    // Create file.
                    Shell.files[args[1]] = (args[2] || '');
                    
                    Shell.write(fileNotice);
                    
                    break;
                case '-a':
                case '-append':
                    // File does not exist.
                    if (!Shell.files.hasOwnProperty(args[1])) {
                        Shell.write(text.errors.noFile);
                        return;
                    }
                                    
                    // Append data to file.
                    Shell.files[args[1]] += (args[2] || '');
                    
                    Shell.write(text.notices.appended.replace(
                        '{file}', args[1]).replace(
                        '{size}', args[2].length
                    ));
                    
                    break;
                case '-g':
                case '-get':                    
                    // File does not exist.
                    if (!Shell.files.hasOwnProperty(args[1])) {
                        Shell.write(text.errors.noFile);
                        return;
                    }
                    
                    Shell.write(Shell.files[args[1]]);
                    
                    break;
                case '-r':
                case '-remove':
                    // File does not exist.
                    if (!Shell.files.hasOwnProperty(args[1])) {
                        Shell.write(text.errors.noFile);
                        return;
                    }

                    delete Shell.files[args[1]];
                    
                    Shell.write(text.notices.deletedFile.replace(
                        '{file}', args[1]
                    ));
                    
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
                    Shell.stack.index = 0;
                    Shell.write(text.notices.clearedStack);
                    return;
                }

                Shell.write(text.history.replace(
                    '{stack}', Shell.stack.list.join(', ')).replace(
                    '{index}', Shell.stack.index
                ));
            }
        }
    };

    // Methods executed when input is invalid.
    this.error = {
        input: function(input) {
            input = input.trim();
            input = (input.length > 16 ?
                     input.substr(0, 16) + '...' : input);

            return text.errors.input.replace('{input}', input);
        }
    };

    // Appends a string to the output container.
    this.write = function(string) {
        output.append('> ' + string + '\n');
    };

    // The brain of jShell.
    this.run = function(input) {
        input = input.trim();

        // command[0] is the command itself.
        // And command[1] is the rest (parameters et cetera.)
        var command = input.explode(' ', 2);
        command[0] = command[0].toLowerCase();

        if (!command[0]) {
            return;
        }
        
        // Push onto stack and reset stack index.
        this.stack.list.push(input);
        this.stack.index = this.stack.list.length;

        // If it is not a valid command, display an error.
        if (!this.command.run.hasOwnProperty(command[0]) &&
            !this.aliases.hasOwnProperty(command[0])) {

            this.write(this.error.input(input));
            return;
        }

        // The command entered is an alias of another command (or set of
        // commands). This may include parameters and their respective
        // values.
        if (this.aliases.hasOwnProperty(command[0])) {
            Shell.command.run[this.aliases[command[0]]](command[1]);
            return;
        }

        // Display help page for given command if parameter is a question
        // mark or 'help'
        if (command[1] === '?' || command[1] === 'help') {
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
        var input = console.val().split(';');
        for (command in input) {
            Shell.run(input[command]);
        }

        console.val(null);

        // Scroll to the bottom of the output container.
        output.scrollTop(output[0].scrollHeight);
    }

});