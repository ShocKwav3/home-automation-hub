const _ = require('lodash');
const figlet = require('figlet');
const chalk = require('chalk');

const messages = require('./helpers/messageHelpers');
const cliServices = require('./services/cliServices');
const boardHelpers = require('./helpers/boardHelpers');
const { getApiServiceInstance } = require('./services/apiServices');
const { logger, getProgramLogger, logStylers } = require('./helpers/logHelpers');
const { apiVersions, apiEndpoints } = require('./config/apiConfig');


logger(figlet.textSync('PÄKÄI !'))

messages.sayWelcome();
messages.sayLoginMessage();

startLoginProcess();

const spinner = cliServices.getSpinner();
const boardProgressBar = cliServices.getProgressBar('Boards');
const apiService = getApiServiceInstance(apiVersions.v1);

async function startLoginProcess () {
    try {
        const programLogger = getProgramLogger('resolveAllBoards');
        const credentials = await cliServices.getLoginCredentials();
        const userDetails = await apiService.post(apiEndpoints.login, {user_email: credentials.useremail, password: credentials.password});

        programLogger(`${logStylers.genericSuccess('Login successful!')} Welcome ${logStylers.values(userDetails.data.data.name)}`);
        apiService.defaults.headers.common['Authorization'] = `Basic ${userDetails.data.data.token}`;
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
    const boardListFromServer = await getBoardListFromServer(userDetail);
    const boardListFromCli = await getBoardListFromCli();

    showBoardsList(
        userDetail,
        boardHelpers.prepareBoardList(boardListFromServer, boardListFromCli)
    );
}

function showBoardsList (userDetail, boardList) {
    const programLogger = getProgramLogger('showBoardsList');

    if (boardList.length < 1) {
        programLogger(`${logStylers.genericError('Seems like you do not have any board registered to particle system')}\nCheck the following:\n  => ${logStylers.genericWarning('If you are properly logged in to particle system. Run "particle login" to complete login')}\n  => ${logStylers.genericWarning('Your devices are registered to particle system')}`, true);

        process.exit(1);
    }

    const boardListTable = boardHelpers.prepareBoardListTable(
        boardList,
        cliServices.initializeTable(boardHelpers.boardsTableHeader)
    );

    console.log(boardListTable.toString());

    showOptionsPicker(userDetail, boardList);
}

async function showOptionsPicker(userDetail, boardList) {
    const registeredBoard = boardList.filter(board => board.isRegistered);
    const unregisteredBoards = boardList.filter(board => !board.isRegistered);
    const actionList = boardHelpers.getActionList(registeredBoard, unregisteredBoards)
    const choice = await cliServices.optionsPicker(actionList);

    switch(choice.option) {
        case 'Register boards':
            registerBoard(userDetail, unregisteredBoards);
            break;
        case 'Unregister boards':
            unregisterBoards(userDetail, registeredBoard);
            break;
        case 'Update token':
            updateBoardTokens(userDetail, registeredBoard);
            break;
        case 'Exit':
            process.exit(2);
            break;
    }
}

async function registerBoard(userDetail, unregisteredBoards) {
    const userPickedBoards = await cliServices.boardSelection(unregisteredBoards);
    const boardsToRegister = unregisteredBoards.filter(board => userPickedBoards.selectedboards.includes(board.boardName));
    const userToken = await cliServices.userTokenInput();

    boardProgressBar.start(boardsToRegister.length, 0, {operation: 'Registration'});

    await Promise.all(boardsToRegister.map(async (board) => {
        await apiService.post(apiEndpoints.boards, {
            user_id: userDetail.id,
            board_id: board.boardId,
            board_name: board.boardName,
            board_user_token: userToken.boardUserToken,
            added_timestamp: new Date().toISOString(),
        });
        boardProgressBar.increment(1);
    }));

    resolveAllBoards(userDetail);
}

async function unregisterBoards(userDetail, registeredBoard) {
    const userPickedBoards = await cliServices.boardSelection(registeredBoard);
    const boardsToUnregiser = registeredBoard.filter(board => userPickedBoards.selectedboards.includes(board.boardName));

    boardProgressBar.start(boardsToUnregiser.length, 0, {operation: 'Unregistration'});

    await Promise.all(boardsToUnregiser.map(async (board) => {
        await apiService.delete(`${apiEndpoints.boards}/${board.id}`);
        boardProgressBar.increment(1);
    }));

    resolveAllBoards(userDetail);
}

async function updateBoardTokens(userDetail, registeredBoard) {
    const userPickedBoards = await cliServices.boardSelection(registeredBoard);
    const userToken = await cliServices.userTokenInput();
    const boardsToUpdateToken = registeredBoard.filter(board => userPickedBoards.selectedboards.includes(board.boardName));

    boardProgressBar.start(boardsToUpdateToken.length, 0, {operation: 'Token update'});

    await Promise.all(boardsToUpdateToken.map(async (board) => {
        await apiService.put(`${apiEndpoints.boards}/${board.id}`, {
            board_user_token: userToken.boardUserToken,
        });
        boardProgressBar.increment(1);
    }));

    resolveAllBoards(userDetail);
}

async function getBoardListFromCli () {
    spinner.message('Fetching board list: From particle cli list');
    spinner.start();

    const programLogger = getProgramLogger('getBoardListFromCli');
    let boardListFromCliFormatted = [];
    const boardDataSanitizers = {
        0: boardHelpers.sanitizeBoardName,
        1: boardHelpers.sanitizeBoardId,
    }

    try {
        const boardListFromCli = await cliServices.getCliData('particle list | grep -i photon');
        const boardListFromCliParsed = cliServices.parseCliData(boardListFromCli.stdout, boardDataSanitizers);
        boardListFromCliFormatted = boardHelpers.formatBoardData(boardListFromCliParsed);

        spinner.stop();

        programLogger(logStylers.genericSuccess(`Boards(from cli) fetched successfully. ${logStylers.basicText('Boards found:')} ${logStylers.values(boardListFromCliFormatted.length)}`));

        return boardListFromCliFormatted;
    } catch (error) {
        spinner.stop();

        if(error.message.includes('Command failed')) {
            programLogger(`Fetching failed: Particle devices\n  => ${logStylers.genericWarning('Check whether you are logged in to particle cli')}`, true);
        } else {
            programLogger(`Fetching failed: Particle devices\n  # ${logStylers.genericError(`Message: ${error.message}`)}`);
        }

        process.exit(1);
    }
}

async function getBoardListFromServer (userDetail) {
    spinner.message(`Fetching your registered boards from server, ${userDetail.name}`);
    spinner.start();

    const programLogger = getProgramLogger('getBoardListFromServer');

    try {
        const boardListFromServer = await apiService.get(apiEndpoints.boards);

        spinner.stop();

        programLogger(logStylers.genericSuccess(`Boards(from server) fetched successfully. ${logStylers.basicText('Boards found:')} ${logStylers.values(boardListFromServer.data.data.length)}`));

        return boardListFromServer.data.data;
    } catch (error) {
        const userChoice = await cliServices.tryAgain('Boards fetch', error.message);

        if (userChoice.retry) {
            getBoardListFromServer(userDetail);
        } else {
            spinner.stop();
            logger('Exiting...');
            process.exit(1);
        }
    }
}
