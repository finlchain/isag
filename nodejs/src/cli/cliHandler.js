
//
const config = require('./../../config/config.js');
const define = require('./../../config/define.js');
const util = require('./../utils/commonUtil.js');
const dbUtil = require('./../db/dbUtil.js');
const dbRepl = require('./../db/dbRepl.js');
const dbShard = require('./../db/dbShard.js');
const logger = require('./../utils/winlog.js');

//
module.exports.handler = async (cmd) => {
    let retVal = true;

    logger.debug('ISAg CLI Received Data : ' + cmd);

    let cmdSplit = cmd.split(' ');

    if(cmd.toString() === "shard server add") 
    {
        await cmd.createShardServers();
    }
    else if(cmd.toString() === "shard server del") 
    {
        await dbShard.dropShardServers();
    }
    else if(cmd.toString() === "shard table add") 
    {
        await dbShard.createShardTables();
    }
    else if (cmd.slice(0, 13) === "replS restart")
    {
        await dbRepl.restartReplSlaves();
    }
    else if (cmd.slice(0, 9) === "replS get")
    {
        await dbRepl.getReplSlaves();
    }
    else if(cmd.slice(0,9) === "act query"){
        await dbUtil.actQuery(cmd.slice(10));
    }
    else if(cmd.slice(0,12) === "maria passwd"){
        //
    }
    else if  (cmd.slice(0,3) === "ips")
    {
        let localIPs = util.getMyIPs();
        //
        await util.asyncForEach(localIPs, async(element, index) => {
            logger.debug("ip[" + index + "] : " + element);
        });
    }
    else
    {
        retVal = false;
        logger.error("[CLI] " + cmd + ' is an incorrect command. See is --help');
    }

    return retVal;
}