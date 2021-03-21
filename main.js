const _ = require('lodash');

const messages = require('./helpers/messageHelpers');
const cliServices = require('./services/cliServices');
const boardHelpers = require('./helpers/boardHelpers');
const { apiServiceInstance } = require('./services/apiServices');
const axios = require('axios')


messages.sayWelcome();
messages.sayLoginMessage();

startLoginProcess();

const spinner = cliServices.runSpinner();
const boardProgressBar = cliServices.getProgressBar('Boards');

async function startLoginProcess () {
    try {
        const credentials = await cliServices.getLoginCredentials();
        const userDetails = await apiServiceInstance().post('/v1/users/login', {user_email: credentials.useremail, password: credentials.password});

        resolveAllBoards(userDetails.data.data);
    } catch (error) {
        console.log('=====>', error.message, error.stack);
        const userChoice = await cliServices.loginTryAgain();

        if (userChoice.retryLogin) {
            startLoginProcess();
        } else {
            console.log('Exiting...');
            process.exit(1);
        }
    }
}

async function resolveAllBoards(userDetail) {
    spinner.message('Fetching registered boards from server');
    spinner.start();

    const boardListFromServer = await apiServiceInstance(userDetail.token).get('/v1/boards');

    spinner.stop();

    showBoardsList(userDetail, boardListFromServer.data.data);
}

async function showBoardsList (userDetail, boardListFromServer) {
    spinner.message('Getting boards: connected and disconnected for both registered and unregistered');
    spinner.start();

    const boardListFromCli = await cliServices.getCliData('particle list | grep -i photon');
    const boardListFromCliParsed = cliServices.parseCliData(boardListFromCli.stdout, boardDataSanitizers);
    const boardListFromCliFormatted = boardHelpers.formatBoardData(boardListFromCliParsed);
    const boardList = boardHelpers.prepareBoardList(boardListFromServer, boardListFromCliFormatted);
    spinner.stop();

    const boardListTable = cliServices.initializeTable(boardHelpers.boardsTableHeader);
    _.forEach(boardList, (board) => {
        boardListTable.push([
            board.boardName,
            board.boardId,
            board.connectionStatus,
            board.isRegistered,
        ]);
    });
    console.log(boardListTable.toString());

    showOptionsPicker(userDetail, boardList);
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
        await apiServiceInstance(userDetail.token).post('/v1/boards', {
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
        await apiServiceInstance(userDetail.token).delete(`/v1/boards/${board.id}`);
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
        await apiServiceInstance(userDetail.token).put(`/v1/boards/${board.id}`, {
            board_user_token: userToken.boardUserToken,
        });
        boardProgressBar.increment(1);
    });
}

const boardDataSanitizers = {
    0: boardHelpers.sanitizeBoardName,
    1: boardHelpers.sanitizeBoardId,
}
