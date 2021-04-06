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

const boardsTableHeader = ['Board name', 'Board id', 'State', 'Registration status'].map(header => chalk.cyan(header));


module.exports = {
    sanitizeBoardName,
    sanitizeBoardId,
    formatBoardData,
    prepareBoardList,
    boardsTableHeader,
}
