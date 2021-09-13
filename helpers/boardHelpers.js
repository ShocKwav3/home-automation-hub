const _ = require('lodash');
const chalk = require('chalk');


const sanitizeBoardName = (boardName) => boardName.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');

const sanitizeBoardId = (boardId) => boardId.replace('[', '').replace(']', '');

const formatBoardData = (boardData) => boardData.map(board => ({
    boardName: board[0],
    boardId: board[1],
    state: board[4],
    isRegistered: false,
}));

const prepareBoardList = (boardListFromServer, boardListFromCliFormatted) => boardListFromCliFormatted.map(board => {
    let boardData = {...board};
    const boardFromServer = _.find(boardListFromServer, {board_id: boardData.boardId});

    if(boardFromServer){
        boardData.isRegistered = true;
        boardData.id = boardFromServer.id;
    }

    return boardData;
});

const prepareBoardListTable = (boardList, tableWithHeaders) => {
    _.forEach(boardList, (board) => {
        const boardData = {...board};
        boardData.state = board.state === 'offline' ? chalk.red(board.state) : chalk.green(board.state);
        boardData.isRegistered = !board.isRegistered ? chalk.red(board.isRegistered) : chalk.green(board.isRegistered);

        tableWithHeaders.push([
            boardData.boardName,
            boardData.boardId,
            boardData.state,
            boardData.isRegistered,
        ]);
    });

    return tableWithHeaders;
}

const boardsTableHeader = ['Board name', 'Board id', 'State', 'Registration status'].map(header => chalk.cyan(header));

const getActionList = (registeredBoard, unregisteredBoards) => {
    let actionList = [];

    if (unregisteredBoards.length !== 0) {
        actionList.push('Register boards');
    }

    if (registeredBoard.length !== 0) {
        actionList = actionList.concat(['Unregister boards', 'Update token']);
    }

    actionList.push('Exit');

    return actionList;
}


module.exports = {
    sanitizeBoardName,
    sanitizeBoardId,
    formatBoardData,
    prepareBoardList,
    boardsTableHeader,
    prepareBoardListTable,
    getActionList,
}
