const _ = require('lodash');
const figlet = require('figlet');
const chalk = require('chalk');

const messages = require('./helpers/messageHelpers');
const cliServices = require('./services/cliServices');
const boardHelpers = require('./helpers/boardHelpers');
const { getApiServiceInstance } = require('./services/apiServices');
const { logger, getProgramLogger, logStylers } = require('./helpers/logHelpers');


logger(figlet.textSync('PAKAI !'))

messages.sayWelcome();
messages.sayLoginMessage();

startLoginProcess();

const spinner = cliServices.runSpinner();
const boardProgressBar = cliServices.getProgressBar('Boards');

async function startLoginProcess () {
    try {
        const programLogger = getProgramLogger('resolveAllBoards');
        const credentials = await cliServices.getLoginCredentials();
        const userDetails = await getApiServiceInstance('v1').post('/users/login', {user_email: credentials.useremail, password: credentials.password});

        programLogger(`${logStylers.genericSuccess('Login successful!')} Welcome ${logStylers.values(userDetails.data.data.name)}`);
        resolveAllBoards(userDetails.data.data);
    } catch (error) {
        const userChoice = await cliServices.tryAgain('Login', error.message);

        if (userChoice.retry) {
            startLoginProcess();
        } else {
            logger('Exiting...');
            process.exit(1);
        }
    }
}

async function resolveAllBoards(userDetail) {
    spinner.message(`Fetching your registered boards from server, ${userDetail.name}`);
    spinner.start();

    const programLogger = getProgramLogger('resolveAllBoards');

    try {
        const boardListFromServer = await getApiServiceInstance('v1', userDetail.token).get('/boards');

        spinner.stop();

        programLogger(logStylers.genericSuccess(`Boards fetched successfully. ${logStylers.basicText('Boards found:')} ${logStylers.values(boardListFromServer.data.data.length)}`))

        showBoardsList(userDetail, boardListFromServer.data.data);
    } catch (error) {
        const userChoice = await cliServices.tryAgain('Boards fetch', error.message);

        if (userChoice.retry) {
            resolveAllBoards(userDetail);
        } else {
            logger('Exiting...');
            process.exit(1);
        }
    }
}

async function showBoardsList (userDetail, boardListFromServer) {
    const programLogger = getProgramLogger('showBoardsList');

    spinner.message('Fetching board list: From particle cli list');
    spinner.start();

    let boardListFromCliFormatted = [];

    try {
        const boardListFromCli = await cliServices.getCliData('particle list | grep -i photon');
        const boardListFromCliParsed = cliServices.parseCliData(boardListFromCli.stdout, boardDataSanitizers);
        boardListFromCliFormatted = boardHelpers.formatBoardData(boardListFromCliParsed);

        spinner.stop();
    } catch (error) {
        spinner.stop();

        if(error.message.includes('Command failed')) {
            programLogger(`Fetching failed: Particle devices\n  => ${logStylers.genericWarning('Check whether you are logged in to particle cli')}`, true);
        } else {
            programLogger(`Fetching failed: Particle devices\n  # ${logStylers.genericError(`Message: ${error.message}`)}`);
        }

        process.exit(1);
    }

    const boardList = boardHelpers.prepareBoardList(boardListFromServer, boardListFromCliFormatted);
    const boardListTable = cliServices.initializeTable(boardHelpers.boardsTableHeader);

    _.forEach(boardList, (board) => {
        const boardData = {...board};
        boardData.state = board.state === 'offline' ? chalk.red(board.state) : chalk.green(board.state);
        boardData.isRegistered = !board.isRegistered ? chalk.red(board.isRegistered) : chalk.green(board.isRegistered);

        boardListTable.push([
            boardData.boardName,
            boardData.boardId,
            boardData.state,
            boardData.isRegistered,
        ]);
    });

    if (boardList.length < 1) {
        programLogger(`${logStylers.genericError('Seems like you do not have any board registered to particle system')}\nCheck the following:\n  => ${logStylers.genericWarning('If you are properly logged in to particle system. Run "particle login" to complete login')}\n  => ${logStylers.genericWarning('Your devices are registered to particle system')}`, true);

        process.exit(1);
    }

    console.log(boardListTable.toString())

    //showOptionsPicker(userDetail, boardList);
}

async function showOptionsPicker(userDetail, boardList) {
    const choice = await cliServices.optionsPicker();

    switch(choice.option) {
        case 'Register boards':
            registerBoard(userDetail, boardList);
            break;
        case 'Unregister boards':
            unregisterBoards(userDetail, boardList);
            break;
        case 'Update token':
            updateBoardTokens(userDetail, boardList);
            break;
        case 'Exit':
            process.exit(2);
            break;
    }
}

async function registerBoard(userDetail, boardList) {
    const unregisteredBoards = boardList.filter(board => !board.isRegistered)
    const userPickedBoards = await cliServices.boardSelection(unregisteredBoards);
    const boardsToRegister = boardList.filter(board => userPickedBoards.selectedboards.includes(board.boardName));
    const userToken = await cliServices.userTokenInput();

    boardProgressBar.start(boardsToRegister.length, 0, {operation: 'Registration'});
    _.forEach(boardsToRegister, async board => {
        await getApiServiceInstance('v1', userDetail.token).post('/boards', {
            user_id: userDetail.id,
            board_id: board.boardId,
            board_name: board.boardName,
            board_user_token: userToken.boardUserToken,
            added_timestamp: new Date().toISOString(),
        });
        boardProgressBar.increment(1);
    });
}

async function unregisterBoards(userDetail, boardList) {
    const registeredBoard = boardList.filter(board => board.isRegistered);
    const userPickedBoards = await cliServices.boardSelection(registeredBoard);
    const boardsToUnregiser = boardList.filter(board => userPickedBoards.selectedboards.includes(board.boardName));

    boardProgressBar.start(boardsToUnregiser.length, 0, {operation: 'Unregistration'});
    _.forEach(boardsToUnregiser, async board => {
        await getApiServiceInstance('v1', userDetail.token).delete(`/boards/${board.id}`);
        boardProgressBar.increment(1);
    });
}

async function updateBoardTokens(userDetail, boardList) {
    const registeredBoard = boardList.filter(board => board.isRegistered);
    const userPickedBoards = await cliServices.boardSelection(registeredBoard);
    const userToken = await cliServices.userTokenInput();
    const boardsToUpdateToken = boardList.filter(board => userPickedBoards.selectedboards.includes(board.boardName));

    boardProgressBar.start(boardsToUpdateToken.length, 0, {operation: 'Token update'});
    _.forEach(boardsToUpdateToken, async board => {
        await getApiServiceInstance('v1', userDetail.token).put(`/boards/${board.id}`, {
            board_user_token: userToken.boardUserToken,
        });
        boardProgressBar.increment(1);
    });
}

const boardDataSanitizers = {
    0: boardHelpers.sanitizeBoardName,
    1: boardHelpers.sanitizeBoardId,
}
