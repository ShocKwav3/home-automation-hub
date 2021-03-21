var table = require('cli-table3');
const { promisify } = require('util');
const execute = promisify(require('child_process').exec);
const inquirer = require('inquirer');
const spinner = require('clui').Spinner;
const cliProgress = require('cli-progress');
const chalk = require('chalk');


const getCliData = (command) => execute(command);

const parseCliData = (stdout, sanitzers = {}) => stdout.split('\n').filter(item => item.length!=0).map(item => {
    return item.split(' ').map((item, index) => {
        return sanitzers[index] ? sanitzers[index](item) : item
    })
});

const runSpinner = (message) => new spinner(message,  ['◜','◠','◝','◞','◡','◟']);
const getProgressBar = (contextName) => new cliProgress.SingleBar({
    format: '{operation} progress |' + chalk.cyan('{bar}') + `| {percentage}% || {value}/{total} ${contextName}`,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
    stopOnComplete: true,
});

const initializeTable = (header) => {
    return new table({
        head: header,
        chars: {
            'top': '═' , 'top-mid': '╤' , 'top-left': '╔' , 'top-right': '╗',
            'bottom': '═' , 'bottom-mid': '╧' , 'bottom-left': '╚' , 'bottom-right': '╝',
            'left': '║' , 'left-mid': '╟' , 'mid': '─' , 'mid-mid': '┼',
            'right': '║' , 'right-mid': '╢' ,
            'middle': '│',
        }
    });
}

const getLoginCredentials = () => {
    return inquirer.prompt([
        {
            name: 'useremail',
            type: 'input',
            message: 'Enter your e-mail address: ',
            validate: function( value ) {
                if (value.length) {
                    return true;
                } else {
                    return 'Please enter your e-mail address';
                }
            }
        },
        {
            name: 'password',
            type: 'password',
            message: 'Enter your password: ',
            validate: function(value) {
                if (value.length) {
                    return true;
                } else {
                    return 'Please enter your password';
                }
            }
        }
    ]);
}

const loginTryAgain = () => {
    return inquirer.prompt([
        {
            name: "retryLogin",
            type: "confirm",
            message: "Login was failed. Would you like to retry?",
        }
    ]);
}

const optionsPicker = () => {
    return inquirer.prompt([
      {
        name: "option",
        type: "list",
        message: "Select desired action:",
        choices: ["Register boards", "Unregister boards", "Update token", "Exit"],
      },
    ]);
}

const boardSelection = (boardList) => {
    return inquirer.prompt([
        {
            name: "selectedboards",
            type: "checkbox",
            message: "Select the ones you would like to register",
            choices: boardList.map(board => board.boardName),
        }
    ]);
}

const userTokenInput = () => {
    return inquirer.prompt([
        {
            name: 'boardUserToken',
            type: 'input',
            message: 'Enter your board token: ',
            validate: function( value ) {
                if (value.length) {
                    return true;
                } else {
                    return 'Please enter your board token';
                }
            }
        },
    ]);
}

module.exports = {
    getCliData,
    parseCliData,
    runSpinner,
    getProgressBar,
    initializeTable,
    getLoginCredentials,
    loginTryAgain,
    optionsPicker,
    boardSelection,
    userTokenInput,
}
