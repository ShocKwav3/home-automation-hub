const consoleHelpers = require('./consoleHelpers');


const user = process.env.USER;
const sayWelcome = () => console.log(`
  ------------------
  |  Moro, ${user}!
  ------------------
`);

const sayLoginMessage = () => console.log(`
Let's get you logged in to the system first...
`);


module.exports = {
    user,
    sayWelcome,
    sayLoginMessage,
}
