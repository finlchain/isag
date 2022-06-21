//
const define = require('./config/define.js');
const sock = require('./src/net/socket.js');
const dbMain = require('./src/db/dbMain.js');
const cli = require('./src/cli/cli.js');

const main = async() => {
  console.log(define.START_MSG);

  await dbMain.initDatabase();

  let isag = await sock.isClient();

  //
  await cli.cliCallback();
}

main();

