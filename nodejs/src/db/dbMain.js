//
const config = require('../../config/config.js');
const define = require('./../../config/define.js');
const util = require('./../utils/commonUtil.js');
const dbUtil = require("./../db/dbUtil.js");
const dbFB = require("./../db/dbFB.js");
const dbIS = require("./../db/dbIS.js");
const dbNN = require("./../db/dbNN.js");
const dbShard = require("./../db/dbShard.js");
const dbRepl = require("./../db/dbRepl.js");
const logger = require('./../utils/winlog.js');

//
module.exports.initDatabase = async () => {
    logger.debug("config.MARIA_CONFIG : " + JSON.stringify(config.MARIA_CONFIG));
    
    //
    await dbFB.initDatabaseFB(); // 

    //
    await dbIS.initDatabaseIS(); // For Replication
    await dbNN.initDatabaseNN(); // For Replication

    //
    // await dbShard.initShard();
    await dbRepl.initReplication();
}
